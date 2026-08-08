#include "SyncCtrl.h"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "SyncCtrl_ingest.hpp"
#include "../services/DbalClient.hpp"
#include "../services/EncryptedSecretClient.hpp"
#include "../services/EnsureFolder.hpp"
#include "../services/ImapClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../util_env.hpp"

namespace email_backend {

namespace {

nlohmann::json fetchAccount(const std::string& accountId,
                             const std::string& userId) {
    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailClient/" + accountId);
    if (!r || !r->ok())
        return nlohmann::json();
    auto entity = r->body.value("data", nlohmann::json::object());
    if (entity.value("userId", "") != userId)
        return nlohmann::json();
    return entity;
}

long readSyncToken(const std::string& folderId) {
    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailFolder/" + folderId);
    if (!r || !r->ok())
        return 0;
    const auto entity = r->body.value("data", nlohmann::json::object());
    const std::string token = entity.value("syncToken", "");
    return token.empty() ? 0 : std::stol(token);
}

void writeSyncToken(const std::string& folderId, long maxUid) {
    nlohmann::json patch;
    patch["syncToken"] = std::to_string(maxUid);
    dbalRequest("PUT",
                "/" + dbalTenant() + "/email_client/EmailFolder/" + folderId,
                &patch);
}

} // namespace

// Uses synchronous DBAL calls throughout: the multi-step read-account ->
// mark-syncing -> IMAP fetch -> ingest -> mark-idle flow is easier to
// follow sequentially than as nested async callbacks. Not a hot path.
void SyncCtrl::trigger(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                        const std::string& accountId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (accountId.empty()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    const auto account = fetchAccount(accountId, auth->userId);
    if (account.is_null()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    if (account.value("isSyncing", false)) {
        Json::Value out;
        out["status"] = "already_syncing";
        cb(jsonResponse(out));
        return;
    }

    const auto folderId = ensureFolder(accountId, "Inbox", "inbox");
    if (!folderId) {
        cb(errorResponse("Failed to prepare inbox folder",
                          drogon::k500InternalServerError));
        return;
    }

    markSyncing(accountId, true);

    try {
        const auto password =
            revealEncryptedSecret(account.value("credentialId", ""));
        if (!password)
            throw std::runtime_error("failed to retrieve credentials");

        ImapConfig cfg;
        cfg.host = account.value("hostname", "");
        cfg.port = intFromJson(account, "port", 993);
        cfg.encryption = account.value("encryption", "tls");
        cfg.username = account.value("username", "");
        cfg.password = *password;
        if (cfg.host.empty())
            cfg.host = envOr("DOVECOT_HOST", "dovecot");

        const long lastUid = readSyncToken(*folderId);
        const auto fetched = ImapClient(cfg).fetchNew(lastUid);
        const auto result =
            ingestFetchedMessages(accountId, *folderId, fetched, lastUid);

        writeSyncToken(*folderId, result.maxUid);
        markSyncing(accountId, false);

        Json::Value out;
        out["status"] = "complete";
        out["newMessages"] = result.newCount;
        cb(jsonResponse(out));
    } catch (const std::exception& e) {
        markSyncing(accountId, false);
        cb(errorResponse(std::string("Sync failed: ") + e.what(),
                          drogon::k500InternalServerError));
    }
}

} // namespace email_backend
