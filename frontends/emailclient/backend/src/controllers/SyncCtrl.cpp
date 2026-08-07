#include "SyncCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"
#include "../services/ImapClient.hpp"
#include "../util.hpp"

namespace email_backend {

// Uses execSqlSync (not execSqlAsync) throughout: the multi-step
// read-status -> mark-syncing -> IMAP fetch -> per-message insert ->
// mark-idle flow is much easier to reason about sequentially than as
// nested async callbacks, and this mirrors codegen-backend's own use of
// execSqlSync for equivalent multi-step logic (see
// frontends/codegen/backend/src/main.cpp's Store class). Sync isn't a
// hot path, so blocking the handling thread for its duration is fine.
void SyncCtrl::trigger(const drogon::HttpRequestPtr& req,
                        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                        const std::string& accountId) {
    auto idOpt = parseId(accountId);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    int id = *idOpt;
    auto tenant = tenantId(req);

    try {
        auto acct = db()->execSqlSync(
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

        db()->execSqlSync(
            "UPDATE email_accounts SET sync_status = 'syncing' WHERE id = $1", id);

        ImapConfig cfg;
        cfg.host = row["imap_host"].as<std::string>();
        cfg.port = row["imap_port"].as<int>();
        cfg.encryption = row["imap_encryption"].as<std::string>();
        cfg.username = row["imap_username"].as<std::string>();
        cfg.password = row["imap_password"].as<std::string>();
        if (cfg.host.empty())
            cfg.host = envOr("DOVECOT_HOST", "dovecot");
        long lastUid = row["last_sync_uid"].as<long>();

        auto fetched = ImapClient(cfg).fetchNew(lastUid);

        int newCount = 0;
        long maxUid = lastUid;
        for (const auto& msg : fetched) {
            auto existing = db()->execSqlSync(
                "SELECT id FROM email_messages WHERE account_id = $1 AND uid = $2",
                id, msg.uid);
            if (!existing.empty())
                continue;

            std::string subject = extractHeader(msg.rawHeaders, "Subject");
            std::string from = extractHeader(msg.rawHeaders, "From");
            std::string to = extractHeader(msg.rawHeaders, "To");
            // Note: the raw "Date" header is kept in rawHeaders but not
            // parsed into date_sent -- RFC 2822 dates carry named
            // day-of-week/timezone-abbreviation formats Postgres can't
            // reliably cast, and full parsing wasn't worth the added
            // surface area for this port. date_sent stays NULL; the old
            // Flask service populated it from imapclient's already-parsed
            // ENVELOPE.date, which this curl-based approach doesn't fetch.
            db()->execSqlSync(
                "INSERT INTO email_messages (account_id, tenant_id, uid, "
                "folder, subject, from_address, to_addresses, "
                "date_received, body_text, is_read) VALUES "
                "($1,$2,$3,'INBOX',$4,$5,$6,now(),$7,$8)",
                id, tenant, msg.uid, subject, from, to, msg.bodyText, msg.seen);
            newCount++;
            if (msg.uid > maxUid)
                maxUid = msg.uid;
        }

        db()->execSqlSync(
            "UPDATE email_accounts SET sync_status = 'idle', "
            "last_sync_at = now(), last_sync_uid = $2 WHERE id = $1",
            id, maxUid);

        Json::Value out;
        out["status"] = "complete";
        out["newMessages"] = newCount;
        cb(jsonResponse(out));
    } catch (const std::exception& e) {
        try {
            db()->execSqlSync(
                "UPDATE email_accounts SET sync_status = 'error' WHERE id = $1", id);
        } catch (...) {
            // Best-effort status update; the original error is what matters.
        }
        cb(errorResponse(std::string("Sync failed: ") + e.what(),
                          drogon::k500InternalServerError));
    }
}

void SyncCtrl::status(const drogon::HttpRequestPtr& req,
                       std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                       const std::string& accountId) {
    auto idOpt = parseId(accountId);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    auto tenant = tenantId(req);

    db()->execSqlAsync(
        "SELECT sync_status, last_sync_at, last_sync_uid FROM email_accounts "
        "WHERE id = $1 AND tenant_id = $2",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            const auto& row = r[0];
            Json::Value out;
            out["status"] = row["sync_status"].as<std::string>();
            out["lastSyncAt"] = row["last_sync_at"].isNull()
                                     ? Json::Value()
                                     : Json::Value(pgTsToIso(row["last_sync_at"].as<std::string>()));
            out["lastSyncUid"] = row["last_sync_uid"].as<int>();
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
