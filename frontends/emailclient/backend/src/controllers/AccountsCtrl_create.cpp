#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void AccountsCtrl::create(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    const auto tenant = tenantId(req);

    const std::string accountName = body->get("accountName", "").asString();
    const std::string emailAddress = body->get("emailAddress", "").asString();
    const std::string imapHost = body->get("imapHost", "").asString();
    const int imapPort = body->get("imapPort", 993).asInt();
    const std::string imapEnc = body->get("imapEncryption", "tls").asString();
    const std::string imapUser = body->get("imapUsername", "").asString();
    const std::string imapPass = body->get("imapPassword", "").asString();
    const std::string smtpHost = body->get("smtpHost", "").asString();
    const int smtpPort = body->get("smtpPort", 587).asInt();
    const std::string smtpEnc = body->get("smtpEncryption", "tls").asString();
    const std::string smtpUser = body->get("smtpUsername", "").asString();
    const std::string smtpPass = body->get("smtpPassword", "").asString();

    db()->execSqlAsync(
        std::string(
            "INSERT INTO email_accounts (tenant_id, account_name, "
            "email_address, imap_host, imap_port, imap_encryption, "
            "imap_username, imap_password, smtp_host, smtp_port, "
            "smtp_encryption, smtp_username, smtp_password) VALUES "
            "($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ") +
            kAccountColumns,
        [cb](const drogon::orm::Result& r) {
            cb(jsonResponse(accountToJson(r[0]), drogon::k201Created));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        tenant, accountName, emailAddress, imapHost, imapPort, imapEnc,
        imapUser, imapPass, smtpHost, smtpPort, smtpEnc, smtpUser, smtpPass);
}

} // namespace email_backend
