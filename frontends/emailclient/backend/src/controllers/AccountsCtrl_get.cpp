#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void AccountsCtrl::get(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                        const std::string& id) {
    const auto idOpt = parseId(id);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto tenant = tenantId(req);
    db()->execSqlAsync(
        std::string("SELECT ") + kAccountColumns +
            " FROM email_accounts WHERE id = $1 AND tenant_id = $2",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            cb(jsonResponse(accountToJson(r[0])));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
