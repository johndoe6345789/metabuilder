#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// Reads the `runTimeout` value from the user's settings panel, clamped
/// to [5, MAX_RUN_TIMEOUT]. Returns nullopt if unset or unparsable.
std::optional<int> getUserRunTimeout(const std::string& userId);

} // namespace pastebin
