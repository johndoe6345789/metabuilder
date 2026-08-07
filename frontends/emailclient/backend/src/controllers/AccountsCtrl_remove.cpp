#include "AccountsCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void AccountsCtrl::remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                           const std::string& id) {
    const auto idOpt = parseId(id);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto tenant = tenantId(req);
    db()->execSqlAsync(
        "DELETE FROM email_accounts WHERE id = $1 AND tenant_id = $2 "
        "RETURNING id",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            Json::Value out;
            out["deleted"] = true;
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
