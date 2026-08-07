#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void AccountsCtrl::list(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto tenant = tenantId(req);
    db()->execSqlAsync(
        std::string("SELECT ") + kAccountColumns +
            " FROM email_accounts WHERE tenant_id = $1 ORDER BY id",
        [cb](const drogon::orm::Result& r) {
            Json::Value out(Json::arrayValue);
            for (const auto& row : r)
                out.append(accountToJson(row));
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        tenant);
}

} // namespace email_backend
