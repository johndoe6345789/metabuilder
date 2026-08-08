#include "ComposeCtrl_send_helper.hpp"
#include "Helpers.hpp"
#include "../services/EncryptedSecretClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SmtpClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void sendViaAccount(const nlohmann::json& account, const std::string& to,
                     const std::string& subject, const std::string& bodyText,
                     const std::string& bodyHtml, const std::string& cc,
                     const std::string& bcc, const std::string& replyTo,
                     const ResponseCb& cb) {
    const auto password =
        revealEncryptedSecret(account.value("smtpCredentialId", ""));
    if (!password) {
        cb(errorResponse("Failed to retrieve SMTP credentials",
                          drogon::k500InternalServerError));
        return;
    }

    SmtpConfig cfg;
    cfg.host = account.value("smtpHost", "");
    cfg.port = intFromJson(account, "smtpPort", 587);
    cfg.encryption = account.value("smtpEncryption", "tls");
    cfg.username = account.value("smtpUsername", "");
    cfg.password = *password;
    if (cfg.host.empty())
        cfg.host = envOr("POSTFIX_HOST", "postfix");

    OutgoingEmail email;
    email.from = account.value("emailAddress", "");
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
