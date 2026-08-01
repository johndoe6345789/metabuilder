/**
 * @file rs_jwt_validator.cpp
 */
#include "rs_jwt_validator.hpp"

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>
#include <spdlog/spdlog.h>

namespace dbal::security {

using Traits = jwt::traits::nlohmann_json;

RsJwtValidator::RsJwtValidator(std::string publicKeyPem, std::string issuer)
    : public_key_pem_(std::move(publicKeyPem)), issuer_(std::move(issuer)) {}

std::optional<JwtClaims> RsJwtValidator::validate(const std::string& token) const {
    if (public_key_pem_.empty()) return std::nullopt;

    try {
        auto decoded = jwt::decode<Traits>(token);

        auto verifier = jwt::verify<jwt::default_clock, Traits>({})
            .allow_algorithm(jwt::algorithm::rs256(public_key_pem_, "", "", ""))
            .with_issuer(issuer_);
        verifier.verify(decoded);

        JwtClaims claims;
        claims.user_id = decoded.get_subject();
        if (decoded.has_audience()) {
            auto aud = decoded.get_audience();
            if (!aud.empty()) claims.aud = *aud.begin();
        }
        claims.iss = decoded.get_issuer();
        claims.exp = std::chrono::duration_cast<std::chrono::seconds>(
            decoded.get_expires_at().time_since_epoch()).count();

        if (decoded.has_payload_claim("tenant_id")) {
            claims.tenant_id = decoded.get_payload_claim("tenant_id").as_string();
        }
        if (decoded.has_payload_claim("scope")) {
            claims.scope = decoded.get_payload_claim("scope").as_string();
        }

        if (claims.user_id.empty()) {
            spdlog::debug("[rs_jwt] Missing 'sub' claim");
            return std::nullopt;
        }
        return claims;
    } catch (const std::exception& e) {
        spdlog::debug("[rs_jwt] Verification failed: {}", e.what());
        return std::nullopt;
    }
}

std::optional<JwtClaims> RsJwtValidator::fromRequest(
    const drogon::HttpRequestPtr& req,
    const std::string& publicKeyPem,
    const std::string& issuer
) {
    auto auth_header = req->getHeader("Authorization");
    static const std::string bearer_prefix = "Bearer ";
    if (auth_header.size() <= bearer_prefix.size() ||
        auth_header.substr(0, bearer_prefix.size()) != bearer_prefix) {
        return std::nullopt;
    }
    RsJwtValidator validator(publicKeyPem, issuer);
    return validator.validate(auth_header.substr(bearer_prefix.size()));
}

} // namespace dbal::security
