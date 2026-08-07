#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// Returns the RSA public key (PEM) for `kid` from DBAL's JWKS, fetching
/// (and caching) the JWKS document as needed, and refetching once if
/// `kid` isn't found in the cached copy (DBAL may have rotated keys).
/// Returns nullopt if DBAL is unreachable or the kid truly isn't present.
std::optional<std::string> rsaPublicKeyForKid(const std::string& kid);

} // namespace pastebin
