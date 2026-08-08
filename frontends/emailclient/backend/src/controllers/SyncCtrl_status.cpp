#include "SyncCtrl.h"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/EnsureFolder.hpp"
#include "../util_env.hpp"

namespace email_backend {

void SyncCtrl::status(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                       const std::string& accountId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (accountId.empty()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailClient/" + accountId);
    if (!r || !r->ok()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto entity = r->body.value("data", nlohmann::json::object());
    if (entity.value("userId", "") != auth->userId) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    long lastSyncUid = 0;
    if (const auto folderId = findFolder(accountId, "Inbox")) {
        const auto fr = dbalRequest("GET", "/" + dbalTenant() +
                                                "/email_client/EmailFolder/" +
                                                *folderId);
        if (fr && fr->ok()) {
            const auto folder =
                fr->body.value("data", nlohmann::json::object());
            const std::string token = folder.value("syncToken", "");
            if (!token.empty())
                lastSyncUid = std::stol(token);
        }
    }

    Json::Value out;
    out["status"] = entity.value("isSyncing", false) ? "syncing" : "idle";
    if (entity.contains("lastSyncAt") && !entity["lastSyncAt"].is_null())
        out["lastSyncAt"] =
            static_cast<Json::Int64>(entity["lastSyncAt"].get<long long>());
    else
        out["lastSyncAt"] = Json::Value();
    out["lastSyncUid"] = static_cast<Json::Int64>(lastSyncUid);
    cb(jsonResponse(out));
}

} // namespace email_backend
