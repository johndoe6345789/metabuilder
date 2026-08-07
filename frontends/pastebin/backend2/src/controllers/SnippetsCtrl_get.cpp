#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../services/SnippetOwnership.hpp"

namespace pastebin {

void SnippetsCtrl::get(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                        const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto snippet = getOwnedSnippet(id, auth->userId);
    if (!snippet) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }
    cb(jsonResponse(nlohmannToJsoncpp(normalizeSnippet(*snippet))));
}

} // namespace pastebin
