#include "JwtJwks_key.hpp"

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>

namespace pastebin {

std::optional<std::pair<std::string, std::string>> findJwkNE(
    const std::string& jwksText, const std::string& kid) {
    try {
        const auto jwks =
            jwt::parse_jwks<jwt::traits::nlohmann_json>(jwksText);
        if (!jwks.has_jwk(kid))
            return std::nullopt;
        const auto jwk = jwks.get_jwk(kid);
        return std::make_pair(jwk.get_jwk_claim("n").as_string(),
                               jwk.get_jwk_claim("e").as_string());
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

} // namespace pastebin
