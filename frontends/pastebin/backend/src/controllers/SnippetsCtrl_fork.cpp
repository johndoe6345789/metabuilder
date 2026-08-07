#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetFork.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::fork(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                         const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    // No ownership check here, matching the old Flask route -- forking
    // works for any snippet id the caller knows (own or shared).
    const auto check =
        dbalRequest("GET", "/" + dbalTenant() + "/pastebin/Snippet/" + id);
    if (!check || !check->ok()) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }
    const auto& source = check->body.value("data", check->body);

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
