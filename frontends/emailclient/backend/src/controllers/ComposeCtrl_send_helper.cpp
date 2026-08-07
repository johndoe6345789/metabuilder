#include "ComposeCtrl_send_helper.hpp"
#include "Helpers.hpp"
#include "../services/SmtpClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void sendViaAccount(const drogon::orm::Row& row, const std::string& to,
                     const std::string& subject, const std::string& bodyText,
                     const std::string& bodyHtml, const std::string& cc,
                     const std::string& bcc, const std::string& replyTo,
                     const ResponseCb& cb) {
    SmtpConfig cfg;
    cfg.host = row["smtp_host"].as<std::string>();
    cfg.port = row["smtp_port"].as<int>();
    cfg.encryption = row["smtp_encryption"].as<std::string>();
    cfg.username = row["smtp_username"].as<std::string>();
    cfg.password = row["smtp_password"].as<std::string>();
    if (cfg.host.empty())
        cfg.host = envOr("POSTFIX_HOST", "postfix");
    if (cfg.port == 0)
        cfg.port = envInt("POSTFIX_PORT", 25);

    OutgoingEmail email;
    email.from = row["email_address"].as<std::string>();
    email.to = to;
    email.subject = subject;
    email.bodyText = bodyText;
    email.bodyHtml = bodyHtml;
    email.cc = cc;
    email.bcc = bcc;
    email.replyTo = replyTo;

    try {
        SmtpClient(cfg).send(email);
        Json::Value out;
        out["sent"] = true;
        out["to"] = to;
        out["subject"] = subject;
        cb(jsonResponse(out));
    } catch (const std::exception& e) {
        cb(errorResponse(std::string("Send failed: ") + e.what(),
                          drogon::k500InternalServerError));
    }
}

} // namespace email_backend
