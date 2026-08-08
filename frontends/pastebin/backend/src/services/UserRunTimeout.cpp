#include "UserRunTimeout.hpp"
#include "DbalClient.hpp"
#include "PastebinSettingsPath.hpp"
#include "../util.hpp"

#include <algorithm>

namespace pastebin {

std::optional<int> getUserRunTimeout(const std::string& userId) {
    const auto r = dbalRequest("GET", pastebinSettingsPath(userId));
    if (!r || !r->ok())
        return std::nullopt;

    try {
        const auto entity = r->body.value("data", r->body);
        const auto settings =
            nlohmann::json::parse(entity.value("settingsJson", "{}"));
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
