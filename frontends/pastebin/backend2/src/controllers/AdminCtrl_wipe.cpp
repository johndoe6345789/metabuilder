#include "AdminCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

void deleteAllSnippets(const std::string& userId) {
    const auto snippets = dbalAllPages(
        "/" + dbalTenant() + "/pastebin/Snippet?filter.userId=" + userId);
    for (const auto& s : snippets) {
        dbalRequest("DELETE", "/" + dbalTenant() + "/pastebin/Snippet/" +
                                   s.value("id", ""));
    }
}

void deleteAllNamespaces(const std::string& userId) {
    const auto namespaces = dbalAllPages(
        "/" + dbalTenant() + "/pastebin/Namespace?filter.userId=" + userId);
    for (const auto& ns : namespaces) {
        dbalRequest("DELETE", "/" + dbalTenant() + "/pastebin/Namespace/" +
                                   ns.value("id", ""));
    }
}

} // namespace

void AdminCtrl::wipe(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    deleteAllSnippets(auth->userId);
    deleteAllNamespaces(auth->userId);

    Json::Value out;
    out["success"] = true;
    out["message"] = "User data wiped";
    cb(jsonResponse(out));
}

} // namespace pastebin
