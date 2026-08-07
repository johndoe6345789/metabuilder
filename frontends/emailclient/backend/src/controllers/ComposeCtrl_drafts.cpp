#include "ComposeCtrl.h"
#include "ComposeCtrl_json.hpp"
#include "Helpers.hpp"
#include "../services/Db.hpp"

namespace email_backend {

void ComposeCtrl::listDrafts(const drogon::HttpRequestPtr& req,
                              ResponseCb&& cb) {
    const auto tenant = tenantId(req);
    db()->execSqlAsync(
        std::string("SELECT ") + kMessageColumns +
            " FROM email_messages WHERE tenant_id = $1 AND is_draft = true",
        [cb](const drogon::orm::Result& r) {
            Json::Value out(Json::arrayValue);
            for (const auto& row : r)
                out.append(messageToJson(row));
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        tenant);
}

void ComposeCtrl::saveDraft(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    const auto tenant = tenantId(req);

    const int accountId = body->get("accountId", 0).asInt();
    const std::string subject = body->get("subject", "").asString();
    const std::string from = body->get("from", "").asString();
    const std::string to = body->get("to", "").asString();
    const std::string cc = body->get("cc", "").asString();
    const std::string bodyText = body->get("body", "").asString();
    const std::string bodyHtml = body->get("bodyHtml", "").asString();

    db()->execSqlAsync(
        std::string(
            "INSERT INTO email_messages (account_id, tenant_id, folder, "
            "subject, from_address, to_addresses, cc_addresses, body_text, "
            "body_html, is_draft) VALUES "
            "($1,$2,'Drafts',$3,$4,$5,$6,$7,$8,true) RETURNING ") +
            kMessageColumns,
        [cb](const drogon::orm::Result& r) {
            cb(jsonResponse(messageToJson(r[0]), drogon::k201Created));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        accountId, tenant, subject, from, to, cc, bodyText, bodyHtml);
}

} // namespace email_backend
