#include "ComposeCtrl.h"
#include "ComposeCtrl_send_helper.hpp"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void ComposeCtrl::send(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    if (!body->isMember("accountId")) {
        cb(errorResponse("accountId required", drogon::k400BadRequest));
        return;
    }

    const int accountId = (*body)["accountId"].asInt();
    const std::string to = body->get("to", "").asString();
    const std::string subject = body->get("subject", "").asString();
    const std::string bodyText = body->get("body", "").asString();
    const std::string bodyHtml = body->get("bodyHtml", "").asString();
    const std::string cc = body->get("cc", "").asString();
    const std::string bcc = body->get("bcc", "").asString();
    const std::string replyTo = body->get("replyTo", "").asString();
    const auto tenant = tenantId(req);

    db()->execSqlAsync(
        "SELECT email_address, smtp_host, smtp_port, smtp_encryption, "
        "smtp_username, smtp_password FROM email_accounts "
        "WHERE id = $1 AND tenant_id = $2",
        [cb, to, subject, bodyText, bodyHtml, cc, bcc,
         replyTo](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            sendViaAccount(r[0], to, subject, bodyText, bodyHtml, cc, bcc,
                            replyTo, cb);
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        accountId, tenant);
}

} // namespace email_backend
