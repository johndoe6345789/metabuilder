#include "NamespacesCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/NamespaceOwnership.hpp"
#include "../services/NamespaceRehome.hpp"
#include "../util.hpp"

namespace pastebin {

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
