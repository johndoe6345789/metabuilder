/**
 * @file multi_alg_jwt_validator.hpp
 * @brief Dispatches JWT verification by the token's own `alg` header.
 *
 * Peeks the unverified header (never trusted for anything but algorithm
 * selection) and routes HS256 tokens to the existing Flask-compat
 * JwtValidator, RS256 tokens to the new DBAL-issued RsJwtValidator. Any
 * other `alg` (including "none") is rejected outright — this is a
 * dispatch-only peek, not a trust decision; each branch still fully
 * verifies its own signature.
 */
#pragma once

#include <optional>
#include <string>
#include <drogon/HttpRequest.h>
#include "jwt_validator.hpp"

namespace dbal::security {

class MultiAlgJwtValidator {
public:
    /**
     * @param hs256Secret   Flask-compat HMAC secret (may be empty if unset).
     * @param rs256PublicKeyPem  DBAL OIDC provider's public key (may be empty if OIDC disabled).
     * @param rs256Issuer   Expected `iss` for RS256 tokens.
     */
    static std::optional<JwtClaims> fromRequest(
        const drogon::HttpRequestPtr& req,
        const std::string& hs256Secret,
        const std::string& rs256PublicKeyPem,
        const std::string& rs256Issuer
    );

private:
    /// Reads the `alg` field out of the token's header segment without verifying anything.
    static std::optional<std::string> peekAlgorithm(const std::string& token);
};

} // namespace dbal::security
