#pragma once

#include "../util.hpp"

#include <string>

namespace pastebin {

/// DBAL entity path for a user's PastebinSettings row (id == userId).
inline std::string pastebinSettingsPath(const std::string& userId) {
    return "/" + dbalTenant() + "/pastebin/PastebinSettings/" + userId;
}

} // namespace pastebin
