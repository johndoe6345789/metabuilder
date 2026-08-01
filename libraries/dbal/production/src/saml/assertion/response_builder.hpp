/**
 * @file response_builder.hpp
 * @brief Builds a signed SP-initiated SAML 2.0 <samlp:Response>.
 *
 * The <saml:Assertion> is what gets signed (per "signed assertions" in
 * scope) — the enclosing <samlp:Response> itself is not separately signed.
 * Bearer SubjectConfirmation + AudienceRestriction + a short validity
 * window are always included; there is no parameter to omit them.
 *
 * Reuses the same RSA keypair the OIDC provider signs JWTs with — one key,
 * one key-management story, rather than a second keypair to generate,
 * persist, and rotate.
 */
#pragma once

#include "../../oidc/crypto/rsa_keypair.hpp"
#include <string>

namespace dbal::saml::assertion {

struct ResponseParams {
    std::string issuer;          ///< IdP entity ID
    std::string spEntityId;      ///< Audience — the SP this assertion is for
    std::string acsUrl;          ///< Destination + Recipient (from the SP registry, never from the request)
    std::string inResponseTo;    ///< The AuthnRequest's own ID
    std::string subjectUsername; ///< NameID value
    std::string sessionIndex;
    long long issueInstant = 0;      ///< Unix seconds
    long long validitySeconds = 300; ///< NotBefore/NotOnOrAfter window width
};

/// Builds and signs the Assertion, returns the full serialized Response XML.
/// @throws std::runtime_error on any XML/signing failure.
std::string buildSignedSamlResponse(const ResponseParams& params,
                                     const dbal::oidc::crypto::RsaKeypair& keypair);

} // namespace dbal::saml::assertion
