/**
 * @file jwt_validator.cpp
 * @brief HS256 JWT validation implementation
 */

#include "jwt_validator.hpp"
#include "base64url.hpp"
#include "../crypto/hmac_sha256.hpp"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>
#include <ctime>
#include <vector>

namespace dbal::security {

JwtValidator::JwtValidator(std::string secret)
    : secret_(std::move(secret)) {}

std::optional<JwtClaims> JwtValidator::validate(const std::string& token) const {
    if (secret_.empty()) return std::nullopt;

    // Split token into header.payload.signature
    std::vector<std::string> parts;
    std::string::size_type start = 0;
    int dots = 0;
    for (std::string::size_type i = 0; i <= token.size(); ++i) {
        if (i == token.size() || (token[i] == '.' && dots < 2)) {
            parts.push_back(token.substr(start, i - start));
            start = i + 1;
            ++dots;
        }
    }
    if (parts.size() != 3 || parts[0].empty() || parts[1].empty() || parts[2].empty()) {
        return std::nullopt;
    }

    // Verify HS256 signature: HMAC-SHA256(secret, header + "." + payload)
    // hmac_sha256 returns lowercase hex; base64url_to_hex converts the sig to the same format.
    std::string signing_input = parts[0] + "." + parts[1];
    std::string expected_hex = hmac_sha256(
        reinterpret_cast<const unsigned char*>(secret_.c_str()),
        secret_.size(),
        signing_input
    );
    std::string provided_hex = base64url_to_hex(parts[2]);

    // Constant-time comparison to prevent timing attacks
    if (expected_hex.size() != provided_hex.size()) return std::nullopt;
    uint8_t diff = 0;
    for (size_t i = 0; i < expected_hex.size(); ++i) {
        diff |= static_cast<uint8_t>(expected_hex[i] ^ provided_hex[i]);
    }
    if (diff != 0) {
        spdlog::debug("[jwt] Signature mismatch");
        return std::nullopt;
    }

    // Decode and parse payload
    try {
        auto payload_bytes = base64url_decode(parts[1]);
        std::string payload_str(payload_bytes.begin(), payload_bytes.end());
        auto payload = nlohmann::json::parse(payload_str);

        JwtClaims claims;
        claims.user_id  = payload.value("sub", std::string{});
        claims.username = payload.value("username", std::string{});
        claims.exp      = payload.value("exp", 0LL);

        if (claims.user_id.empty()) {
            spdlog::debug("[jwt] Missing 'sub' claim");
            return std::nullopt;
        }
        if (claims.exp > 0 && claims.exp < static_cast<long long>(std::time(nullptr))) {
            spdlog::debug("[jwt] Token expired (exp={})", claims.exp);
            return std::nullopt;
        }
        return claims;
    } catch (const std::exception& e) {
        spdlog::debug("[jwt] Payload parse error: {}", e.what());
        return std::nullopt;
    }
}

std::optional<JwtClaims> JwtValidator::fromRequest(
    const drogon::HttpRequestPtr& req,
    const std::string& secret
) {
    auto auth_header = req->getHeader("Authorization");
    static const std::string bearer_prefix = "Bearer ";
    if (auth_header.size() <= bearer_prefix.size() ||
        auth_header.substr(0, bearer_prefix.size()) != bearer_prefix) {
        return std::nullopt;
    }
    JwtValidator validator(secret);
    return validator.validate(auth_header.substr(bearer_prefix.size()));
}

} // namespace dbal::security
