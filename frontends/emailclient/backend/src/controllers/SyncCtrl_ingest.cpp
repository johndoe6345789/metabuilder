#include "SyncCtrl_ingest.hpp"
#include "../services/Db.hpp"
#include "../util_address.hpp"

namespace email_backend {

IngestResult ingestFetchedMessages(int accountId, const std::string& tenant,
                                    const std::vector<FetchedMessage>& fetched,
                                    long lastUid) {
    IngestResult result;
    result.maxUid = lastUid;

    for (const auto& msg : fetched) {
        const auto existing = db()->execSqlSync(
            "SELECT id FROM email_messages WHERE account_id = $1 AND uid = $2",
            accountId, msg.uid);
        if (!existing.empty())
            continue;

        const std::string subject = extractHeader(msg.rawHeaders, "Subject");
        const std::string from = extractHeader(msg.rawHeaders, "From");
        const std::string to = extractHeader(msg.rawHeaders, "To");
        // Note: the raw "Date" header is kept in rawHeaders but not parsed
        // into date_sent -- RFC 2822 dates carry named day-of-week/
        // timezone-abbreviation formats Postgres can't reliably cast, and
        // full parsing wasn't worth the added surface area for this port.
        db()->execSqlSync(
            "INSERT INTO email_messages (account_id, tenant_id, uid, "
            "folder, subject, from_address, to_addresses, date_received, "
            "body_text, is_read) VALUES "
            "($1,$2,$3,'INBOX',$4,$5,$6,now(),$7,$8)",
            accountId, tenant, msg.uid, subject, from, to, msg.bodyText,
            msg.seen);
        result.newCount++;
        if (msg.uid > result.maxUid)
            result.maxUid = msg.uid;
    }
    return result;
}

void markSyncStatus(int accountId, const std::string& status) {
    db()->execSqlSync(
        "UPDATE email_accounts SET sync_status = $2 WHERE id = $1",
        accountId, status);
}

} // namespace email_backend
