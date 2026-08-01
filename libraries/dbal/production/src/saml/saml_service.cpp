/**
 * @file saml_service.cpp
 */
#include "saml_service.hpp"
#include "binding/redirect_binding.hpp"
#include "binding/authn_request_parser.hpp"
#include "binding/base64_standard.hpp"
#include "assertion/response_builder.hpp"
#include "../security/tokens/generate_token.hpp"

#include <chrono>
#include <spdlog/spdlog.h>

namespace dbal::saml {

namespace {
long long nowUnix() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}

std::string xmlEscape(const std::string& in) {
    std::string out;
    out.reserve(in.size());
    for (char c : in) {
        switch (c) {
            case '&': out += "&amp;"; break;
            case '<': out += "&lt;"; break;
            case '>': out += "&gt;"; break;
            case '"': out += "&quot;"; break;
            default: out += c;
        }
    }
    return out;
}
} // namespace

SamlService::SamlService(dbal::Client& client, metadata::SpRegistry spRegistry,
                          oidc::crypto::RsaKeypair keypair, std::string issuer)
    : client_(client),
      sp_registry_(std::move(spRegistry)),
      keypair_(std::move(keypair)),
      issuer_(std::move(issuer)),
      request_store_(client_, /*ttlSeconds=*/300) {}

std::string SamlService::metadataDocument() const {
    // v1 simplification: no <KeyDescriptor> — this static SP-registry model
    // already assumes out-of-band key exchange between IdP/SP operators
    // (the same RSA public key is already published at /oidc/jwks.json).
    // Adding a spec-complete ds:KeyInfo/RSAKeyValue here is a documented,
    // deliberate follow-up, not an oversight.
    std::string sso = issuer_ + "/saml/sso";
    return
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        "<EntityDescriptor xmlns=\"urn:oasis:names:tc:SAML:2.0:metadata\" entityID=\"" +
        xmlEscape(issuer_) + "\">"
        "<IDPSSODescriptor protocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\">"
        "<SingleSignOnService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\" Location=\"" +
        xmlEscape(sso) + "\"/>"
        "</IDPSSODescriptor>"
        "</EntityDescriptor>";
}

Result<std::string> SamlService::handleSsoRequest(const std::string& samlRequestParam,
                                                    const std::optional<std::string>& relayState) {
    std::string xml;
    try {
        xml = binding::decodeRedirectBinding(samlRequestParam);
    } catch (const std::exception& e) {
        return Error::validationError(std::string("malformed SAMLRequest: ") + e.what());
    }

    std::string parseError;
    auto parsed = binding::parseAuthnRequest(xml, parseError);
    if (!parsed) {
        return Error::validationError("invalid AuthnRequest: " + parseError);
    }

    auto sp = sp_registry_.get(parsed->issuer);
    if (!sp) {
        return Error::validationError("unknown service provider: " + parsed->issuer);
    }

    // ACS URL always comes from the registry — never from the AuthnRequest
    // itself, which would let an attacker redirect a legitimate assertion
    // to an arbitrary endpoint.
    state::PendingSamlRequest pending;
    pending.requestId = parsed->id;
    pending.spEntityId = sp->entity_id;
    pending.acsUrl = sp->acs_url;
    pending.relayState = relayState;

    auto storeResult = request_store_.store(pending);
    if (storeResult.isError()) {
        return storeResult.error();
    }
    return parsed->id;
}

Result<IssuedSamlResponse> SamlService::issueResponse(const std::string& requestId, const std::string& username) {
    auto pendingResult = request_store_.take(requestId);
    if (pendingResult.isError()) {
        return pendingResult.error();
    }
    const auto& pending = pendingResult.value();

    assertion::ResponseParams params;
    params.issuer = issuer_;
    params.spEntityId = pending.spEntityId;
    params.acsUrl = pending.acsUrl;
    params.inResponseTo = pending.requestId;
    params.subjectUsername = username;
    params.sessionIndex = dbal::security::generate_token();
    params.issueInstant = nowUnix();
    params.validitySeconds = 300;

    std::string responseXml;
    try {
        responseXml = assertion::buildSignedSamlResponse(params, keypair_);
    } catch (const std::exception& e) {
        spdlog::error("[saml] Failed to build signed Response: {}", e.what());
        return Error::internal("failed to build SAML response");
    }

    IssuedSamlResponse issued;
    issued.acsUrl = pending.acsUrl;
    issued.samlResponseBase64 = binding::base64_encode(responseXml);
    issued.relayState = pending.relayState;
    return issued;
}

} // namespace dbal::saml
