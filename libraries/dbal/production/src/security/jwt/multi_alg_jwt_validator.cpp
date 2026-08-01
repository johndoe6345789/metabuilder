/**
 * @file multi_alg_jwt_validator.cpp
 */
#include "multi_alg_jwt_validator.hpp"
#include "rs_jwt_validator.hpp"
#include "base64url.hpp"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

namespace dbal::security {

std::optional<std::string> MultiAlgJwtValidator::peekAlgorithm(const std::string& token) {
    auto dot = token.find('.');
    if (dot == std::string::npos || dot == 0) return std::nullopt;

    try {
        auto header_bytes = base64url_decode(token.substr(0, dot));
        std::string header_str(header_bytes.begin(), header_bytes.end());
        auto header = nlohmann::json::parse(header_str);
        return header.value("alg", std::string());
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

std::optional<JwtClaims> MultiAlgJwtValidator::fromRequest(
    const drogon::HttpRequestPtr& req,
    const std::string& hs256Secret,
    const std::string& rs256PublicKeyPem,
    const std::string& rs256Issuer
) {
    auto auth_header = req->getHeader("Authorization");
    static const std::string bearer_prefix = "Bearer ";
    if (auth_header.size() <= bearer_prefix.size() ||
        auth_header.substr(0, bearer_prefix.size()) != bearer_prefix) {
        return std::nullopt;
    }
    std::string token = auth_header.substr(bearer_prefix.size());

    auto alg = peekAlgorithm(token);
    if (!alg) return std::nullopt;

    if (*alg == "HS256") {
        if (hs256Secret.empty()) return std::nullopt;
        JwtValidator validator(hs256Secret);
        return validator.validate(token);
    }
    if (*alg == "RS256") {
        if (rs256PublicKeyPem.empty()) return std::nullopt;
        RsJwtValidator validator(rs256PublicKeyPem, rs256Issuer);
        return validator.validate(token);
    }

    spdlog::debug("[multi_alg_jwt] Rejected unsupported alg: {}", *alg);
    return std::nullopt;
}

} // namespace dbal::security
