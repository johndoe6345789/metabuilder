/**
 * @file authn_request_parser.cpp
 */
#include "authn_request_parser.hpp"

#include <libxml/parser.h>
#include <libxml/tree.h>

namespace dbal::saml::binding {

namespace {
constexpr const char* kSamlProtocolNs = "urn:oasis:names:tc:SAML:2.0:protocol";
constexpr const char* kSamlAssertionNs = "urn:oasis:names:tc:SAML:2.0:assertion";

std::string nodeText(xmlNodePtr node) {
    if (!node) return "";
    xmlChar* content = xmlNodeGetContent(node);
    std::string result = content ? reinterpret_cast<const char*>(content) : "";
    if (content) xmlFree(content);
    return result;
}
} // namespace

std::optional<ParsedAuthnRequest> parseAuthnRequest(const std::string& xml, std::string& errorOut) {
    // XML_PARSE_NONET only — deliberately NOT XML_PARSE_NOENT or
    // XML_PARSE_DTDLOAD, so entity/DTD processing is never enabled in the
    // first place (belt-and-suspenders on top of the process-wide entity
    // loader installed in xmlsec_context.cpp).
    xmlDocPtr doc = xmlReadMemory(xml.data(), static_cast<int>(xml.size()),
                                  "authnrequest.xml", nullptr, XML_PARSE_NONET);
    if (!doc) {
        errorOut = "malformed XML";
        return std::nullopt;
    }

    if (xmlGetIntSubset(doc) != nullptr) {
        errorOut = "document has a DOCTYPE — rejected";
        xmlFreeDoc(doc);
        return std::nullopt;
    }

    xmlNodePtr root = xmlDocGetRootElement(doc);
    if (!root || !root->ns ||
        !xmlStrEqual(root->name, reinterpret_cast<const xmlChar*>("AuthnRequest")) ||
        !xmlStrEqual(root->ns->href, reinterpret_cast<const xmlChar*>(kSamlProtocolNs))) {
        errorOut = "root element is not samlp:AuthnRequest";
        xmlFreeDoc(doc);
        return std::nullopt;
    }

    xmlChar* idRaw = xmlGetProp(root, reinterpret_cast<const xmlChar*>("ID"));
    if (!idRaw) {
        errorOut = "AuthnRequest missing ID attribute";
        xmlFreeDoc(doc);
        return std::nullopt;
    }
    std::string id = reinterpret_cast<const char*>(idRaw);
    xmlFree(idRaw);

    xmlNodePtr issuerNode = nullptr;
    for (xmlNodePtr cur = root->children; cur; cur = cur->next) {
        if (cur->type == XML_ELEMENT_NODE && cur->ns &&
            xmlStrEqual(cur->name, reinterpret_cast<const xmlChar*>("Issuer")) &&
            xmlStrEqual(cur->ns->href, reinterpret_cast<const xmlChar*>(kSamlAssertionNs))) {
            issuerNode = cur;
            break;
        }
    }
    std::string issuer = nodeText(issuerNode);
    if (issuer.empty()) {
        errorOut = "AuthnRequest missing saml:Issuer";
        xmlFreeDoc(doc);
        return std::nullopt;
    }

    xmlFreeDoc(doc);

    ParsedAuthnRequest result;
    result.id = id;
    result.issuer = issuer;
    return result;
}

} // namespace dbal::saml::binding
