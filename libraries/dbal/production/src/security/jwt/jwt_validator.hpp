/**
 * @file jwt_validator.hpp
 * @brief HS256 JWT validation using the existing HMAC-SHA256 utility.
 *
 * Validates Flask-issued JWTs (flask-jwt-extended, HS256).
 * Secret must match JWT_SECRET_KEY env var used by Flask.
 */
#pragma once

#include <optional>
#include <string>

namespace dbal::security {

/**
 * @brief Decoded, verified JWT payload claims.
 */
struct JwtClaims {
    std::string user_id;    ///< "sub" field — owner UUID
    std::string username;   ///< "username" field
    long long   exp = 0;    ///< Unix timestamp expiry (0 = no expiry check)

    // Additive-optional: populated by RsJwtValidator (DBAL-issued RS256
    // tokens), left empty by the original HS256 (Flask) path. Callers that
    // cross-check tenant_id must fall back to URL-only trust when it's
    // empty — see server_routes.cpp's tenant cross-check for why the
    // fallback exists and must not be tightened into a hard-require.
    std::string tenant_id;
    std::string scope;
    std::string aud;
    std::string iss;
    std::string role;  ///< populated by RsJwtValidator only, same as tenant_id above.
};

/**
 * @brief HS256 JWT validator.
 *
 * Validates the signature and expiry of a JWT token.
 * Does NOT communicate with Flask — purely local HMAC verification.
 */
class JwtValidator {
public:
    explicit JwtValidator(std::string secret);

    /**
     * @brief Validate a JWT token string.
     * @return Claims if valid and not expired, std::nullopt otherwise.
     */
    std::optional<JwtClaims> validate(const std::string& token) const;

private:
    std::string secret_;
};

} // namespace dbal::security
