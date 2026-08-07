#include "NamespacesCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/NamespaceJson.hpp"
#include "../util.hpp"

namespace pastebin {

void NamespacesCtrl::list(const drogon::HttpRequestPtr& req,
                           ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto items =
        dbalAllPages("/" + dbalTenant() +
                     "/pastebin/Namespace?filter.userId=" + auth->userId +
                     "&sort.isDefault=desc&sort.name=asc");
    Json::Value out(Json::arrayValue);
    for (const auto& item : items)
        out.append(nlohmannToJsoncpp(normalizeNamespace(item)));
    cb(jsonResponse(out));
}

} // namespace pastebin
