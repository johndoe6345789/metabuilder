#include "SyncCtrl_ingest.hpp"
#include "../services/DbalClient.hpp"
#include "../util_address.hpp"
#include "../util_env.hpp"

#include <set>

namespace email_backend {

namespace {

std::set<std::string> existingUids(const std::string& folderId) {
    std::set<std::string> uids;
    const auto rows = dbalAllPages(
        "/" + dbalTenant() +
        "/email_client/EmailMessage?filter.folderId=" + folderId);
    for (const auto& row : rows) {
        const std::string uid = row.value("imapUid", "");
        if (!uid.empty())
            uids.insert(uid);
    }
    return uids;
}

nlohmann::json toCreateOp(const std::string& emailClientId,
                           const std::string& folderId,
                           const FetchedMessage& msg) {
    const std::string uidStr = std::to_string(msg.uid);
    std::string messageId = extractHeader(msg.rawHeaders, "Message-ID");
    if (messageId.empty())
        messageId = "imap-uid:" + uidStr;
    const std::string to = extractHeader(msg.rawHeaders, "To");

    nlohmann::json data;
    data["emailClientId"] = emailClientId;
    data["folderId"] = folderId;
    data["messageId"] = messageId;
    data["imapUid"] = uidStr;
    data["from"] = extractHeader(msg.rawHeaders, "From");
    data["to"] = to.empty() ? nlohmann::json::array()
                             : nlohmann::json::array({to});
    data["subject"] = extractHeader(msg.rawHeaders, "Subject");
    data["textBody"] = msg.bodyText;
    data["receivedAt"] = nowEpochMillis();
    data["isRead"] = msg.seen;

    nlohmann::json op;
    op["action"] = "create";
    op["entity"] = "EmailMessage";
    op["data"] = data;
    return op;
}

} // namespace

IngestResult ingestFetchedMessages(const std::string& emailClientId,
                                    const std::string& folderId,
                                    const std::vector<FetchedMessage>& fetched,
                                    long lastUid) {
    IngestResult result;
    result.maxUid = lastUid;

    const auto seen = existingUids(folderId);
    nlohmann::json operations = nlohmann::json::array();

    for (const auto& msg : fetched) {
        if (seen.count(std::to_string(msg.uid)))
            continue;
        operations.push_back(toCreateOp(emailClientId, folderId, msg));
        result.newCount++;
        if (msg.uid > result.maxUid)
            result.maxUid = msg.uid;
    }

    if (!operations.empty()) {
        nlohmann::json body;
        body["operations"] = operations;
        dbalRequest("POST", "/" + dbalTenant() + "/email_client/_batch",
                    &body);
    }
    return result;
}

void markSyncing(const std::string& emailClientId, bool syncing) {
    nlohmann::json patch;
    patch["isSyncing"] = syncing;
    dbalRequest("PUT",
                "/" + dbalTenant() + "/email_client/EmailClient/" +
                    emailClientId,
                &patch);
}

} // namespace email_backend
