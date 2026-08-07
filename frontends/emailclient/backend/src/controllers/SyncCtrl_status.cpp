#include "SyncCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void SyncCtrl::status(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                       const std::string& accountId) {
    const auto idOpt = parseId(accountId);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto tenant = tenantId(req);

    db()->execSqlAsync(
        "SELECT sync_status, last_sync_at, last_sync_uid FROM "
        "email_accounts WHERE id = $1 AND tenant_id = $2",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            const auto& row = r[0];
            const auto& tsField = row["last_sync_at"];
            Json::Value out;
            out["status"] = row["sync_status"].as<std::string>();
            out["lastSyncAt"] =
                tsField.isNull()
                    ? Json::Value()
                    : Json::Value(pgTsToIso(tsField.as<std::string>()));
            out["lastSyncUid"] = row["last_sync_uid"].as<int>();
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
