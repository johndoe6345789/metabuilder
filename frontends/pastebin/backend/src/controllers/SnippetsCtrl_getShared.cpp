#include "SnippetsCtrl.h"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../services/UserLookup.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::getShared(const drogon::HttpRequestPtr&, ResponseCb&& cb,
                              const std::string& token) {
    const auto r =
        dbalRequest("GET", "/" + dbalTenant() +
                                "/pastebin/Snippet?filter.shareToken=" +
                                token + "&limit=1");
    if (!r || !r->ok()) {
        cb(errorResponse("Not found", drogon::k404NotFound));
        return;
    }
    const auto items = r->body.value("data", r->body).value(
        "data", nlohmann::json::array());
    if (items.empty()) {
        cb(errorResponse("Not found", drogon::k404NotFound));
        return;
    }

    const auto& snippet = items.front();
    auto result = normalizeSnippet(snippet);
    result["authorUsername"] =
        resolveUsername(snippet.value("userId", ""));
    cb(jsonResponse(nlohmannToJsoncpp(result)));
}

} // namespace pastebin
