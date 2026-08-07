#pragma once

#include <cstdint>
#include <string>

namespace pastebin {

/// Returns the stored settings JSON for a user, or "{}" if none.
std::string getUserSettingsJson(const std::string& userId);

void putUserSettingsJson(const std::string& userId, const std::string& json,
                          int64_t updatedAtMs);

} // namespace pastebin
