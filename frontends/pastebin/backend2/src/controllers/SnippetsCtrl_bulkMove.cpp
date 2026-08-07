#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/NamespaceOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

bool moveOneSnippet(const std::string& sid, const std::string& targetNs,
                     const std::string& userId) {
    const auto sr =
        dbalRequest("GET", "/" + dbalTenant() + "/pastebin/Snippet/" + sid);
    if (!sr || !sr->ok())
        return false;
    auto snippet = sr->body.value("data", sr->body);
    if (snippet.value("userId", "") != userId)
        return false;
    snippet["namespaceId"] = targetNs;
    const auto r = dbalRequest(
        "PUT", "/" + dbalTenant() + "/pastebin/Snippet/" + sid, &snippet);
    return r && r->ok();
}

} // namespace

void SnippetsCtrl::bulkMove(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    if (!body || !body->isMember("snippetIds") ||
        !body->isMember("targetNamespaceId") ||
        (*body)["snippetIds"].empty()) {
        cb(errorResponse("snippetIds and targetNamespaceId required",
                          drogon::k400BadRequest));
        return;
    }
    const std::string targetNs = (*body)["targetNamespaceId"].asString();
    if (!getOwnedNamespace(targetNs, auth->userId)) {
        cb(errorResponse("Target namespace not found", drogon::k404NotFound));
        return;
    }

    int failures = 0;
    for (const auto& sid : (*body)["snippetIds"]) {
        if (!moveOneSnippet(sid.asString(), targetNs, auth->userId))
            failures++;
    }
    if (failures > 0) {
        cb(errorResponse("Failed to move " + std::to_string(failures) +
                              " snippet(s)",
                          drogon::k500InternalServerError));
        return;
    }
    Json::Value out;
    out["success"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
