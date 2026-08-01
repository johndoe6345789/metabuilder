/**
 * @file authn_request_parser.hpp
 * @brief XXE-hardened parsing of an SP-supplied <samlp:AuthnRequest>.
 *
 * Only the two fields this IdP actually trusts from the request are
 * extracted: its ID (echoed back as the Response's InResponseTo) and its
 * Issuer (looked up in the static SP registry). The AuthnRequest's own
 * AssertionConsumerServiceURL is deliberately never read — the ACS URL
 * always comes from the registry, never from attacker-controlled input.
 */
#pragma once

#include <optional>
#include <string>

namespace dbal::saml::binding {

struct ParsedAuthnRequest {
    std::string id;
    std::string issuer;
};

/**
 * @brief Parses raw AuthnRequest XML (already decoded from the
 *        HTTP-Redirect binding). Rejects any document with a DOCTYPE
 *        outright — SAML XML never legitimately has one — and never
 *        resolves external entities regardless (XML_PARSE_NOENT and
 *        XML_PARSE_DTDLOAD are never passed to the parser).
 * @param errorOut set to a human-readable reason on failure.
 */
std::optional<ParsedAuthnRequest> parseAuthnRequest(const std::string& xml, std::string& errorOut);

} // namespace dbal::saml::binding
