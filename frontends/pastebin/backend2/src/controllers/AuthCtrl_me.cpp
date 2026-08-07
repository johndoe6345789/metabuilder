#include "AuthCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

void AuthCtrl::me(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/core/User/" + auth->userId);
    if (r && r->ok()) {
        const auto profile = r->body.value("data", r->body);
        if (profile.contains("username") && profile["username"].is_string()) {
            Json::Value out;
            out["id"] = profile.value("id", auth->userId);
            out["username"] = profile.value("username", auth->username);
            cb(jsonResponse(out));
            return;
        }
    }

    Json::Value out;
    out["id"] = auth->userId;
    out["username"] = auth->username;
    cb(jsonResponse(out));
}

} // namespace pastebin
