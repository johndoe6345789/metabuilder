#include "UserRunTimeout.hpp"
#include "DbSettings.hpp"
#include "../util.hpp"

#include <algorithm>
#include <nlohmann/json.hpp>

namespace pastebin {

std::optional<int> getUserRunTimeout(const std::string& userId) {
    try {
        const auto settings = nlohmann::json::parse(
            getUserSettingsJson(userId));
        if (!settings.contains("runTimeout") ||
            settings["runTimeout"].is_null()) {
            return std::nullopt;
        }
        const int raw = settings["runTimeout"].get<int>();
        const int maxTimeout = envInt("MAX_RUN_TIMEOUT", 300);
        return std::clamp(raw, 5, maxTimeout);
    } catch (const std::exception&) {
        return std::nullopt;
    }
}

} // namespace pastebin
