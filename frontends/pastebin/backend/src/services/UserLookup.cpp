#include "UserLookup.hpp"
#include "DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

std::string resolveUsername(const std::string& userId) {
    if (userId.empty())
        return "unknown";
    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/core/User/" + userId);
    if (r && r->ok()) {
        const auto profile = r->body.value("data", r->body);
        if (profile.contains("username") && profile["username"].is_string() &&
            !profile["username"].get<std::string>().empty()) {
            return profile["username"].get<std::string>();
        }
    }
    return userId;
}

} // namespace pastebin
