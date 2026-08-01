/**
 * @file response_builder.cpp
 */
#include "response_builder.hpp"
#include "../xmldsig/signer.hpp"
#include "../../security/tokens/generate_token.hpp"

#include <libxml/tree.h>
#include <ctime>
#include <stdexcept>

namespace dbal::saml::assertion {

namespace {

constexpr const char* kSamlProtocolNs = "urn:oasis:names:tc:SAML:2.0:protocol";
constexpr const char* kSamlAssertionNs = "urn:oasis:names:tc:SAML:2.0:assertion";

std::string iso8601Utc(long long unixSeconds) {
    std::time_t t = static_cast<std::time_t>(unixSeconds);
    std::tm tmBuf{};
#if defined(_WIN32)
    gmtime_s(&tmBuf, &t);
#else
    gmtime_r(&t, &tmBuf);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &tmBuf);
    return std::string(buf);
}

std::string newSamlId() {
    // SAML IDs are xsd:ID — must start with a letter or underscore, never a digit.
    return "_" + dbal::security::generate_token();
}

xmlNodePtr addChild(xmlNodePtr parent, xmlNsPtr ns, const char* name, const char* content = nullptr) {
    xmlNodePtr node = xmlNewChild(parent, ns, reinterpret_cast<const xmlChar*>(name),
                                  content ? reinterpret_cast<const xmlChar*>(content) : nullptr);
    return node;
}

} // namespace

std::string buildSignedSamlResponse(const ResponseParams& params,
                                     const dbal::oidc::crypto::RsaKeypair& keypair) {
    std::string responseId = newSamlId();
    std::string assertionId = newSamlId();
    std::string issueInstantStr = iso8601Utc(params.issueInstant);
    std::string notBeforeStr = iso8601Utc(params.issueInstant);
    std::string notOnOrAfterStr = iso8601Utc(params.issueInstant + params.validitySeconds);

    xmlDocPtr doc = xmlNewDoc(reinterpret_cast<const xmlChar*>("1.0"));

    // ===== <samlp:Response> =====
    xmlNodePtr response = xmlNewNode(nullptr, reinterpret_cast<const xmlChar*>("Response"));
    xmlNsPtr samlpNs = xmlNewNs(response, reinterpret_cast<const xmlChar*>(kSamlProtocolNs),
                                reinterpret_cast<const xmlChar*>("samlp"));
    xmlNsPtr samlNs = xmlNewNs(response, reinterpret_cast<const xmlChar*>(kSamlAssertionNs),
                               reinterpret_cast<const xmlChar*>("saml"));
    xmlSetNs(response, samlpNs);
    xmlDocSetRootElement(doc, response);

    xmlNewProp(response, reinterpret_cast<const xmlChar*>("ID"),
               reinterpret_cast<const xmlChar*>(responseId.c_str()));
    xmlNewProp(response, reinterpret_cast<const xmlChar*>("Version"), reinterpret_cast<const xmlChar*>("2.0"));
    xmlNewProp(response, reinterpret_cast<const xmlChar*>("IssueInstant"),
               reinterpret_cast<const xmlChar*>(issueInstantStr.c_str()));
    xmlNewProp(response, reinterpret_cast<const xmlChar*>("Destination"),
               reinterpret_cast<const xmlChar*>(params.acsUrl.c_str()));
    xmlNewProp(response, reinterpret_cast<const xmlChar*>("InResponseTo"),
               reinterpret_cast<const xmlChar*>(params.inResponseTo.c_str()));

    addChild(response, samlNs, "Issuer", params.issuer.c_str());

    xmlNodePtr status = addChild(response, samlpNs, "Status");
    xmlNodePtr statusCode = addChild(status, samlpNs, "StatusCode");
    xmlNewProp(statusCode, reinterpret_cast<const xmlChar*>("Value"),
               reinterpret_cast<const xmlChar*>("urn:oasis:names:tc:SAML:2.0:status:Success"));

    // ===== <saml:Assertion> =====
    xmlNodePtr assertion = xmlNewChild(response, samlNs, reinterpret_cast<const xmlChar*>("Assertion"), nullptr);
    xmlNewProp(assertion, reinterpret_cast<const xmlChar*>("ID"),
               reinterpret_cast<const xmlChar*>(assertionId.c_str()));
    xmlNewProp(assertion, reinterpret_cast<const xmlChar*>("Version"), reinterpret_cast<const xmlChar*>("2.0"));
    xmlNewProp(assertion, reinterpret_cast<const xmlChar*>("IssueInstant"),
               reinterpret_cast<const xmlChar*>(issueInstantStr.c_str()));

    xmlNodePtr assertionIssuer = addChild(assertion, samlNs, "Issuer", params.issuer.c_str());

    // <saml:Subject>
    xmlNodePtr subject = addChild(assertion, samlNs, "Subject");
    xmlNodePtr nameId = addChild(subject, samlNs, "NameID", params.subjectUsername.c_str());
    xmlNewProp(nameId, reinterpret_cast<const xmlChar*>("Format"),
               reinterpret_cast<const xmlChar*>("urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified"));

    xmlNodePtr subjConf = addChild(subject, samlNs, "SubjectConfirmation");
    xmlNewProp(subjConf, reinterpret_cast<const xmlChar*>("Method"),
               reinterpret_cast<const xmlChar*>("urn:oasis:names:tc:SAML:2.0:cm:bearer"));
    xmlNodePtr subjConfData = addChild(subjConf, samlNs, "SubjectConfirmationData");
    xmlNewProp(subjConfData, reinterpret_cast<const xmlChar*>("Recipient"),
               reinterpret_cast<const xmlChar*>(params.acsUrl.c_str()));
    xmlNewProp(subjConfData, reinterpret_cast<const xmlChar*>("NotOnOrAfter"),
               reinterpret_cast<const xmlChar*>(notOnOrAfterStr.c_str()));
    xmlNewProp(subjConfData, reinterpret_cast<const xmlChar*>("InResponseTo"),
               reinterpret_cast<const xmlChar*>(params.inResponseTo.c_str()));

    // <saml:Conditions>
    xmlNodePtr conditions = addChild(assertion, samlNs, "Conditions");
    xmlNewProp(conditions, reinterpret_cast<const xmlChar*>("NotBefore"),
               reinterpret_cast<const xmlChar*>(notBeforeStr.c_str()));
    xmlNewProp(conditions, reinterpret_cast<const xmlChar*>("NotOnOrAfter"),
               reinterpret_cast<const xmlChar*>(notOnOrAfterStr.c_str()));
    xmlNodePtr audienceRestriction = addChild(conditions, samlNs, "AudienceRestriction");
    addChild(audienceRestriction, samlNs, "Audience", params.spEntityId.c_str());

    // <saml:AuthnStatement>
    xmlNodePtr authnStatement = addChild(assertion, samlNs, "AuthnStatement");
    xmlNewProp(authnStatement, reinterpret_cast<const xmlChar*>("AuthnInstant"),
               reinterpret_cast<const xmlChar*>(issueInstantStr.c_str()));
    xmlNewProp(authnStatement, reinterpret_cast<const xmlChar*>("SessionIndex"),
               reinterpret_cast<const xmlChar*>(params.sessionIndex.c_str()));
    xmlNodePtr authnContext = addChild(authnStatement, samlNs, "AuthnContext");
    addChild(authnContext, samlNs, "AuthnContextClassRef",
             "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport");

    // Sign the Assertion (not the enclosing Response) — inserted right after <Issuer>.
    dbal::saml::xmldsig::signElement(doc, assertion, assertionIssuer, assertionId, keypair.privateKeyPem());

    xmlChar* buf = nullptr;
    int size = 0;
    xmlDocDumpFormatMemory(doc, &buf, &size, /*format=*/0);
    if (!buf) {
        xmlFreeDoc(doc);
        throw std::runtime_error("Failed to serialize signed SAML Response");
    }
    std::string result(reinterpret_cast<char*>(buf), size);
    xmlFree(buf);
    xmlFreeDoc(doc);
    return result;
}

} // namespace dbal::saml::assertion
