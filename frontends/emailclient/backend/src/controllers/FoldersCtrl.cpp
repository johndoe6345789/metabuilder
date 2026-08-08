#include "FoldersCtrl.h"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/EncryptedSecretClient.hpp"
#include "../services/ImapClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../util_env.hpp"

namespace email_backend {

void FoldersCtrl::list(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
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

    const auto password =
        revealEncryptedSecret(entity.value("credentialId", ""));
    if (!password) {
        cb(errorResponse("Failed to retrieve credentials",
                          drogon::k500InternalServerError));
        return;
    }

    ImapConfig cfg;
    cfg.host = entity.value("hostname", "");
    cfg.port = intFromJson(entity, "port", 993);
    cfg.encryption = entity.value("encryption", "tls");
    cfg.username = entity.value("username", "");
    cfg.password = *password;
    if (cfg.host.empty())
        cfg.host = envOr("DOVECOT_HOST", "dovecot");

    try {
        auto folders = ImapClient(cfg).listFolders();
        Json::Value out(Json::arrayValue);
        for (const auto& f : folders) {
            Json::Value fo;
            fo["name"] = f.name;
            fo["delimiter"] = f.delimiter;
            Json::Value flags(Json::arrayValue);
            for (const auto& fl : f.flags)
                flags.append(fl);
            fo["flags"] = flags;
            out.append(fo);
        }
        cb(jsonResponse(out));
    } catch (const std::exception& e) {
        cb(errorResponse(std::string("IMAP error: ") + e.what(),
                          drogon::k500InternalServerError));
    }
}

} // namespace email_backend
