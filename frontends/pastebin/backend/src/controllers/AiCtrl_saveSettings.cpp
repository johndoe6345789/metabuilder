#include "AiCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/Base64.hpp"
#include "../services/DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

void AiCtrl::saveSettings(const drogon::HttpRequestPtr& req,
                           ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    const std::string apiKey =
        body && body->isMember("apiKey") ? (*body)["apiKey"].asString() : "";

    nlohmann::json patch;
    patch["aiPlatform"] =
        body && body->isMember("platformId") && !(*body)["platformId"].isNull()
            ? nlohmann::json((*body)["platformId"].asString())
            : nlohmann::json(nullptr);
    if (!apiKey.empty())
        patch["aiKey"] = encodeBase64(apiKey);

    const auto r = dbalRequest(
        "PATCH", "/" + dbalTenant() + "/core/User/" + auth->userId, &patch);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to save settings",
                          drogon::k500InternalServerError));
        return;
    }

    Json::Value out;
    out["success"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
