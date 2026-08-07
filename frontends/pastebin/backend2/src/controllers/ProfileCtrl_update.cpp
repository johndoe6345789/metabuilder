#include "ProfileCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../util.hpp"

namespace pastebin {

void ProfileCtrl::update(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    nlohmann::json patch = nlohmann::json::object();
    if (body && body->isMember("bio")) {
        std::string bio = (*body)["bio"].asString();
        if (bio.size() > 2000)
            bio.resize(2000);
        patch["bio"] = bio;
    }
    if (patch.empty()) {
        cb(errorResponse("No updatable fields provided",
                          drogon::k400BadRequest));
        return;
    }

    const auto r = dbalRequest(
        "PUT", "/" + dbalTenant() + "/core/User/" + auth->userId, &patch);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to update profile",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(nlohmannToJsoncpp(r->body.value("data", r->body))));
}

} // namespace pastebin
