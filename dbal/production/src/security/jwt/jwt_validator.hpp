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
#include <drogon/HttpRequest.h>

namespace dbal::security {

/**
 * @brief Decoded, verified JWT payload claims.
 */
struct JwtClaims {
    std::string user_id;    ///< "sub" field — owner UUID
    std::string username;   ///< "username" field
    long long   exp = 0;    ///< Unix timestamp expiry (0 = no expiry check)
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

    /**
     * @brief Extract Bearer token from Authorization header and validate.
     * @return Claims if valid, std::nullopt if missing/invalid/expired.
     */
    static std::optional<JwtClaims> fromRequest(
        const drogon::HttpRequestPtr& req,
        const std::string& secret
    );

private:
    std::string secret_;
};

} // namespace dbal::security
