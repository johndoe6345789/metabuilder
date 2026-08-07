#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/RandomToken.hpp"
#include "../services/SnippetOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::share(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                          const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (!getOwnedSnippet(id, auth->userId)) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }

    const std::string token = generateUrlSafeToken(24);
    nlohmann::json patch;
    patch["shareToken"] = token;
    const auto r = dbalRequest(
        "PATCH", "/" + dbalTenant() + "/pastebin/Snippet/" + id, &patch);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to generate share token",
                          drogon::k500InternalServerError));
        return;
    }
    Json::Value out;
    out["token"] = token;
    cb(jsonResponse(out));
}

} // namespace pastebin
