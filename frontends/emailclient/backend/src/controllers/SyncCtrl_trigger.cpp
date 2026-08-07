#include "SyncCtrl.h"
#include "Helpers.hpp"
#include "SyncCtrl_ingest.hpp"
#include "../services/Db.hpp"
#include "../services/ImapClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

// Uses execSqlSync throughout: the multi-step read-status -> mark-syncing
// -> IMAP fetch -> ingest -> mark-idle flow is easier to follow
// sequentially than as nested async callbacks. Not a hot path.
void SyncCtrl::trigger(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                        const std::string& accountId) {
    const auto idOpt = parseId(accountId);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const int id = *idOpt;
    const auto tenant = tenantId(req);

    try {
        const auto acct = db()->execSqlSync(
            "SELECT imap_host, imap_port, imap_encryption, imap_username, "
            "imap_password, last_sync_uid, sync_status FROM email_accounts "
            "WHERE id = $1 AND tenant_id = $2",
            id, tenant);
        if (acct.empty()) {
            cb(errorResponse("Account not found", drogon::k404NotFound));
            return;
        }
        const auto& row = acct[0];
        if (row["sync_status"].as<std::string>() == "syncing") {
            Json::Value out;
            out["status"] = "already_syncing";
            cb(jsonResponse(out));
            return;
        }

        markSyncStatus(id, "syncing");

        ImapConfig cfg;
        cfg.host = row["imap_host"].as<std::string>();
        cfg.port = row["imap_port"].as<int>();
        cfg.encryption = row["imap_encryption"].as<std::string>();
        cfg.username = row["imap_username"].as<std::string>();
        cfg.password = row["imap_password"].as<std::string>();
        if (cfg.host.empty())
            cfg.host = envOr("DOVECOT_HOST", "dovecot");
        const long lastUid = row["last_sync_uid"].as<long>();

        const auto fetched = ImapClient(cfg).fetchNew(lastUid);
        const auto result =
            ingestFetchedMessages(id, tenant, fetched, lastUid);

        db()->execSqlSync(
            "UPDATE email_accounts SET sync_status = 'idle', "
            "last_sync_at = now(), last_sync_uid = $2 WHERE id = $1",
            id, result.maxUid);

        Json::Value out;
        out["status"] = "complete";
        out["newMessages"] = result.newCount;
        cb(jsonResponse(out));
    } catch (const std::exception& e) {
        try {
            markSyncStatus(id, "error");
        } catch (...) {
            // Best-effort; the original error is what matters.
        }
        cb(errorResponse(std::string("Sync failed: ") + e.what(),
                          drogon::k500InternalServerError));
    }
}

} // namespace email_backend
