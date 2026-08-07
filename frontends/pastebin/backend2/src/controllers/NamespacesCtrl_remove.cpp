#include "NamespacesCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/NamespaceOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

std::string findDefaultNamespaceId(const std::string& userId,
                                    const std::string& excludeId) {
    const auto all = dbalAllPages("/" + dbalTenant() +
                                   "/pastebin/Namespace?filter.userId=" +
                                   userId);
    for (const auto& ns : all) {
        if (ns.value("isDefault", false) &&
            ns.value("id", std::string()) != excludeId)
            return ns.value("id", "");
    }
    return "";
}

bool rehomeSnippets(const std::string& namespaceId, const std::string& userId,
                     const std::string& defaultNsId) {
    const auto snippets =
        dbalAllPages("/" + dbalTenant() +
                     "/pastebin/Snippet?filter.namespaceId=" + namespaceId);
    for (auto snippet : snippets) {
        if (snippet.value("userId", "") != userId)
            continue;
        snippet["namespaceId"] = defaultNsId;
        const auto sid = snippet.value("id", "");
        const auto r = dbalRequest(
            "PUT", "/" + dbalTenant() + "/pastebin/Snippet/" + sid, &snippet);
        if (!r || !r->ok())
            return false;
    }
    return true;
}

} // namespace

void NamespacesCtrl::remove(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb, const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto ns = getOwnedNamespace(id, auth->userId);
    if (!ns) {
        cb(errorResponse("Namespace not found", drogon::k404NotFound));
        return;
    }
    if (ns->value("isDefault", false)) {
        cb(errorResponse("Cannot delete default namespace",
                          drogon::k400BadRequest));
        return;
    }

    const auto defaultNsId = findDefaultNamespaceId(auth->userId, id);
    if (!rehomeSnippets(id, auth->userId, defaultNsId)) {
        cb(errorResponse("Failed to move snippets before deletion",
                          drogon::k500InternalServerError));
        return;
    }

    const auto r =
        dbalRequest("DELETE", "/" + dbalTenant() + "/pastebin/Namespace/" + id);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to delete namespace",
                          drogon::k500InternalServerError));
        return;
    }
    Json::Value out;
    out["success"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
