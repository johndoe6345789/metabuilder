#include "FoldersCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"
#include "../services/ImapClient.hpp"
#include "../util.hpp"

namespace email_backend {

void FoldersCtrl::list(const drogon::HttpRequestPtr& req,
                        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                        const std::string& accountId) {
    auto idOpt = parseId(accountId);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    auto tenant = tenantId(req);

    db()->execSqlAsync(
        "SELECT imap_host, imap_port, imap_encryption, imap_username, "
        "imap_password FROM email_accounts WHERE id = $1 AND tenant_id = $2",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            const auto& row = r[0];
            ImapConfig cfg;
            cfg.host = row["imap_host"].as<std::string>();
            cfg.port = row["imap_port"].as<int>();
            cfg.encryption = row["imap_encryption"].as<std::string>();
            cfg.username = row["imap_username"].as<std::string>();
            cfg.password = row["imap_password"].as<std::string>();
            if (cfg.host.empty())
                cfg.host = envOr("DOVECOT_HOST", "dovecot");
            if (cfg.port == 0)
                cfg.port = cfg.encryption == "tls" ? envInt("DOVECOT_IMAP_SSL_PORT", 993)
                                                    : envInt("DOVECOT_IMAP_PORT", 143);

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
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
