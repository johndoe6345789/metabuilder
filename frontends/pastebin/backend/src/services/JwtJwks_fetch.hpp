#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// Returns the raw JWKS JSON document text, from an in-memory cache
/// unless `forceRefresh` is set (or nothing has been fetched yet).
/// Returns nullopt if DBAL's JWKS endpoint is unreachable.
std::optional<std::string> fetchJwks(bool forceRefresh);

} // namespace pastebin
