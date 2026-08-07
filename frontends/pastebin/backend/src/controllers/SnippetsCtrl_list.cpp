#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../util.hpp"

namespace pastebin {

void SnippetsCtrl::list(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto items = dbalAllPages("/" + dbalTenant() +
                                     "/pastebin/Snippet?filter.userId=" +
                                     auth->userId + "&sort.updatedAt=desc");
    Json::Value out(Json::arrayValue);
    for (const auto& item : items)
        out.append(nlohmannToJsoncpp(normalizeSnippet(item)));
    cb(jsonResponse(out));
}

} // namespace pastebin
