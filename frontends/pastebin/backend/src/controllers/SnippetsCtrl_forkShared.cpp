#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetFork.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::forkShared(const drogon::HttpRequestPtr& req,
                               ResponseCb&& cb, const std::string& token) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto r =
        dbalRequest("GET", "/" + dbalTenant() +
                                "/pastebin/Snippet?filter.shareToken=" +
                                token + "&limit=1");
    if (!r || !r->ok()) {
        cb(errorResponse("Not found", drogon::k404NotFound));
        return;
    }
    const auto items = r->body.value("data", r->body).value(
        "data", nlohmann::json::array());
    if (items.empty()) {
        cb(errorResponse("Not found", drogon::k404NotFound));
        return;
    }

    const auto& source = items.front();
    const auto body = req->getJsonObject();
    std::string newTitle = (body && body->isMember("title"))
                                ? (*body)["title"].asString()
                                : "";
    if (newTitle.empty())
        newTitle = source.value("title", std::string("Snippet")) + " (fork)";

    const auto [result, status] = forkSnippet(source, newTitle, auth->userId);
    cb(jsonResponse(nlohmannToJsoncpp(result),
                     static_cast<drogon::HttpStatusCode>(status)));
}

} // namespace pastebin
