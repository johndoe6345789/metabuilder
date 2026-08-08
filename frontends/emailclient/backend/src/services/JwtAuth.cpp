#include "JwtAuth.hpp"
#include "JwtJwks.hpp"
#include "../util_env.hpp"

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>

namespace email_backend {

namespace {

using Traits = jwt::traits::nlohmann_json;

AuthResult toAuthResult(const jwt::decoded_jwt<Traits>& decoded) {
    AuthResult result;
    result.userId = decoded.get_payload_claim("sub").as_string();
    result.username = decoded.has_payload_claim("username")
                           ? decoded.get_payload_claim("username").as_string()
                           : result.userId;
    return result;
}

} // namespace

std::optional<AuthResult> verifyBearerToken(
    const drogon::HttpRequestPtr& req) {
    const auto authHeader = req->getHeader("Authorization");
    if (authHeader.rfind("Bearer ", 0) != 0)
        return std::nullopt;
    const std::string token = authHeader.substr(7);

    try {
        const auto decoded = jwt::decode<Traits>(token);
        if (decoded.get_algorithm() != "RS256")
            return std::nullopt;

        const auto pem = rsaPublicKeyForKid(decoded.get_key_id());
        if (!pem)
            return std::nullopt;

        const std::string audience =
            envOr("DBAL_OIDC_CLIENT_ID", "emailclient-web");
        auto verifier = jwt::verify<jwt::default_clock, Traits>({})
                             .allow_algorithm(
                                 jwt::algorithm::rs256(*pem, "", "", ""))
                             .with_audience(audience);
        const std::string issuer = envOr("DBAL_OIDC_ISSUER", "");
        if (!issuer.empty())
            verifier = verifier.with_issuer(issuer);
        verifier.verify(decoded);

        return toAuthResult(decoded);
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

} // namespace email_backend
