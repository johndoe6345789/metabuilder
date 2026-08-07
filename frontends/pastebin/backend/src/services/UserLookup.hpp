#pragma once

#include <string>

namespace pastebin {

/// Resolves a Snippet/Namespace's userId to a display username via DBAL,
/// falling back to the raw userId (or "unknown" if empty) if the lookup
/// fails.
std::string resolveUsername(const std::string& userId);

} // namespace pastebin
