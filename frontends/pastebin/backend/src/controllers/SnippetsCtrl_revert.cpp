#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../services/SnippetOwnership.hpp"
#include "../services/SnippetRevisions.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::revert(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                           const std::string& id, const std::string& revId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (!getOwnedSnippet(id, auth->userId)) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }

    const auto revR = dbalRequest(
        "GET", "/" + dbalTenant() + "/pastebin/SnippetRevision/" + revId);
    if (!revR || !revR->ok()) {
        cb(errorResponse("Revision not found", drogon::k404NotFound));
        return;
    }
    const auto rev = revR->body.value("data", revR->body);
    const std::string code = rev.value("code", "");
    const std::string filesJson =
        rev.contains("files") && rev["files"].is_string()
            ? rev["files"].get<std::string>()
            : "";

    nlohmann::json patch;
    patch["code"] = code;
    patch["files"] =
        filesJson.empty() ? nlohmann::json(nullptr) : nlohmann::json(filesJson);
    patch["updatedAt"] = nowEpochMillis();
    const auto r = dbalRequest(
        "PATCH", "/" + dbalTenant() + "/pastebin/Snippet/" + id, &patch);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to revert snippet",
                          drogon::k500InternalServerError));
        return;
    }

    maybeSaveRevision(id, code, filesJson, auth->userId);
    cb(jsonResponse(nlohmannToJsoncpp(
        normalizeSnippet(r->body.value("data", patch)))));
}

} // namespace pastebin
