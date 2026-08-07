#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::revisions(const drogon::HttpRequestPtr& req,
                              ResponseCb&& cb, const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (!getOwnedSnippet(id, auth->userId)) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }

    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() +
                   "/pastebin/SnippetRevision?filter.snippetId=" + id +
                   "&sort=-createdAt&limit=50");
    if (!r || !r->ok()) {
        cb(jsonResponse(Json::Value(Json::arrayValue)));
        return;
    }

    auto items = r->body.value("data", r->body).value(
        "data", nlohmann::json::array());
    for (auto& rev : items) {
        if (rev.contains("files") && rev["files"].is_string()) {
            const auto text = rev["files"].get<std::string>();
            try {
                rev["files"] = text.empty() ? nlohmann::json(nullptr)
                                             : nlohmann::json::parse(text);
            } catch (const std::exception&) {
                rev["files"] = nullptr;
            }
        }
    }
    cb(jsonResponse(nlohmannToJsoncpp(items)));
}

} // namespace pastebin
