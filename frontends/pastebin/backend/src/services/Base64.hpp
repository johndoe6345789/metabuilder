#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// Standard (non-URL-safe, padded) base64 -- matches Python's
/// base64.b64encode/b64decode, used to lightly obfuscate a stored AI API
/// key (not real encryption, just avoids plaintext in logs/DB dumps).
std::string encodeBase64(const std::string& raw);

/// Returns nullopt on malformed input rather than throwing, mirroring
/// the old Flask code's `try/except: pass`.
std::optional<std::string> decodeBase64(const std::string& encoded);

} // namespace pastebin
