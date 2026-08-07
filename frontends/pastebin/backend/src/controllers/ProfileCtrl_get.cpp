#include "ProfileCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

void respondNotFound(const ResponseCb& cb) {
    cb(errorResponse("Profile not found", drogon::k404NotFound));
}

} // namespace

void ProfileCtrl::get(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto username = req->getParameter("username");
    if (!username.empty()) {
        const auto r = dbalRequest("GET", "/" + dbalTenant() +
                                               "/core/User?filter.username=" +
                                               username + "&limit=1");
        if (r && r->ok()) {
            const auto items = r->body.value("data", r->body).value(
                "data", nlohmann::json::array());
            if (!items.empty()) {
                cb(jsonResponse(nlohmannToJsoncpp(items.front())));
                return;
            }
        }
        respondNotFound(cb);
        return;
    }

    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/core/User/" + auth->userId);
    if (r && r->ok()) {
        cb(jsonResponse(nlohmannToJsoncpp(r->body.value("data", r->body))));
        return;
    }
    respondNotFound(cb);
}

} // namespace pastebin
