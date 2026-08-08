#include "JwtJwks.hpp"
#include "JwtJwks_fetch.hpp"
#include "JwtJwks_key.hpp"

namespace email_backend {

std::optional<std::string> rsaPublicKeyForKid(const std::string& kid) {
    auto jwksText = fetchJwks(/*forceRefresh=*/false);
    if (!jwksText)
        return std::nullopt;

    auto ne = findJwkNE(*jwksText, kid);
    if (!ne) {
        // Key not in the cached copy -- DBAL may have rotated its keys.
        // Refetch once before giving up.
        jwksText = fetchJwks(/*forceRefresh=*/true);
        if (!jwksText)
            return std::nullopt;
        ne = findJwkNE(*jwksText, kid);
        if (!ne)
            return std::nullopt;
    }

    return rsaPemFromNE(ne->first, ne->second);
}

} // namespace email_backend
