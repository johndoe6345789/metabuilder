#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/SnippetOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                           const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (!getOwnedSnippet(id, auth->userId)) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }

    const auto r =
        dbalRequest("DELETE", "/" + dbalTenant() + "/pastebin/Snippet/" + id);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to delete snippet",
                          drogon::k500InternalServerError));
        return;
    }
    Json::Value out;
    out["success"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
