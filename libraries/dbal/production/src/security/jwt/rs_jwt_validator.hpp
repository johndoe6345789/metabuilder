/**
 * @file rs_jwt_validator.hpp
 * @brief RS256 JWT validation for DBAL-issued OIDC access tokens.
 *
 * Verifies tokens signed by oidc::tokens::issueAccessToken/issueIdToken
 * against the OIDC provider's own public key. Local-only verification,
 * no network round trip, mirroring the pattern already proven in
 * businessplanner/next_extra_primary's KeycloakVerifier.cpp.
 */
#pragma once

#include <optional>
#include <string>
#include "jwt_validator.hpp" // JwtClaims

namespace dbal::security {

class RsJwtValidator {
public:
    /// @param publicKeyPem SubjectPublicKeyInfo PEM (RsaKeypair::publicKeyPem()).
    RsJwtValidator(std::string publicKeyPem, std::string issuer);

    /**
     * @brief Validate an RS256 JWT: signature, issuer, expiry.
     *        alg is pinned to RS256 by construction (jwt-cpp's
     *        allow_algorithm allowlist) — alg:none / algorithm-confusion
     *        attacks are rejected before any claim is even read.
     */
    std::optional<JwtClaims> validate(const std::string& token) const;

private:
    std::string public_key_pem_;
    std::string issuer_;
};

} // namespace dbal::security
