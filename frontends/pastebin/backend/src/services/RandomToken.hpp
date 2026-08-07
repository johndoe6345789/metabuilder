#pragma once

#include <cstddef>
#include <string>

namespace pastebin {

/// Generates a random URL-safe token, matching Python's
/// `secrets.token_urlsafe(numBytes)` (base64url, no padding).
std::string generateUrlSafeToken(size_t numBytes);

} // namespace pastebin
