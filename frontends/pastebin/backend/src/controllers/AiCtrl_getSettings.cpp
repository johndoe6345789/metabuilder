#include "AiCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

void AiCtrl::getSettings(const drogon::HttpRequestPtr& req,
                          ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/core/User/" + auth->userId);
    if (!r || !r->ok()) {
        cb(errorResponse("User not found", drogon::k404NotFound));
        return;
    }

    const auto user = r->body.value("data", r->body);
    Json::Value out;
    if (user.contains("aiPlatform") && user["aiPlatform"].is_string())
        out["platformId"] = user["aiPlatform"].get<std::string>();
    else
        out["platformId"] = Json::Value();
    out["hasKey"] = !user.value("aiKey", "").empty();
    cb(jsonResponse(out));
}

} // namespace pastebin
