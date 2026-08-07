#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

bool hasRequiredFields(const Json::Value& data) {
    for (const char* field : {"title", "code", "language", "category"}) {
        if (!data.isMember(field) || data[field].asString().empty())
            return false;
    }
    return true;
}

} // namespace

void SnippetsCtrl::create(const drogon::HttpRequestPtr& req,
                           ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    if (!hasRequiredFields(*body)) {
        cb(errorResponse("title, code, language, and category are required",
                          drogon::k400BadRequest));
        return;
    }

    const auto dbalBody = buildSnippetBody(*body, auth->userId, true, true);
    const auto r = dbalRequest(
        "POST", "/" + dbalTenant() + "/pastebin/Snippet", &dbalBody);
    if (!r || !r->ok() || !r->body.contains("data")) {
        cb(errorResponse("Failed to create snippet",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(nlohmannToJsoncpp(normalizeSnippet(r->body["data"])),
                     drogon::k201Created));
}

} // namespace pastebin
