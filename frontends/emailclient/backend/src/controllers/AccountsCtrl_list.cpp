#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void AccountsCtrl::list(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto accounts =
        dbalAllPages("/" + dbalTenant() +
                     "/email_client/EmailClient?filter.userId=" +
                     auth->userId);

    Json::Value out(Json::arrayValue);
    for (const auto& entity : accounts)
        out.append(accountToJson(entity));
    cb(jsonResponse(out));
}

} // namespace email_backend
