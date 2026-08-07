#include "ComposeCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"
#include "../services/SmtpClient.hpp"
#include "../util.hpp"

namespace email_backend {

namespace {

const char* kMessageColumns =
    "id, account_id, message_id, uid, folder, subject, from_address, "
    "to_addresses, cc_addresses, bcc_addresses, body_text, body_html, "
    "has_attachments, is_read, is_starred, is_draft, date_sent, date_received";

Json::Value optionalString(const drogon::orm::Field& f) {
    return f.isNull() ? Json::Value() : Json::Value(f.as<std::string>());
}

Json::Value optionalTimestamp(const drogon::orm::Field& f) {
    return f.isNull() ? Json::Value() : Json::Value(pgTsToIso(f.as<std::string>()));
}

Json::Value messageToJson(const drogon::orm::Row& row) {
    Json::Value o;
    o["id"] = row["id"].as<int>();
    o["accountId"] = row["account_id"].as<int>();
    o["messageId"] = optionalString(row["message_id"]);
    o["uid"] = row["uid"].isNull() ? Json::Value() : Json::Value(row["uid"].as<int>());
    o["folder"] = row["folder"].as<std::string>();
    o["subject"] = optionalString(row["subject"]);
    o["from"] = optionalString(row["from_address"]);
    o["to"] = optionalString(row["to_addresses"]);
    o["cc"] = optionalString(row["cc_addresses"]);
    o["bcc"] = optionalString(row["bcc_addresses"]);
    o["bodyText"] = optionalString(row["body_text"]);
    o["bodyHtml"] = optionalString(row["body_html"]);
    o["hasAttachments"] = row["has_attachments"].as<bool>();
    o["isRead"] = row["is_read"].as<bool>();
    o["isStarred"] = row["is_starred"].as<bool>();
    o["isDraft"] = row["is_draft"].as<bool>();
    o["dateSent"] = optionalTimestamp(row["date_sent"]);
    o["dateReceived"] = optionalTimestamp(row["date_received"]);
    return o;
}

} // namespace

void ComposeCtrl::send(const drogon::HttpRequestPtr& req,
                        std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;

    if (!body->isMember("accountId")) {
        cb(errorResponse("accountId required", drogon::k400BadRequest));
        return;
    }
    int accountId = (*body)["accountId"].asInt();
    std::string to = body->get("to", "").asString();
    std::string subject = body->get("subject", "").asString();
    std::string bodyText = body->get("body", "").asString();
    std::string bodyHtml = body->get("bodyHtml", "").asString();
    std::string cc = body->get("cc", "").asString();
    std::string bcc = body->get("bcc", "").asString();
    std::string replyTo = body->get("replyTo", "").asString();
    auto tenant = tenantId(req);

    db()->execSqlAsync(
        "SELECT email_address, smtp_host, smtp_port, smtp_encryption, "
        "smtp_username, smtp_password FROM email_accounts "
        "WHERE id = $1 AND tenant_id = $2",
        [cb, to, subject, bodyText, bodyHtml, cc, bcc, replyTo](
            const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            const auto& row = r[0];
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
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        accountId, tenant);
}

void ComposeCtrl::listDrafts(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    auto tenant = tenantId(req);
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

void ComposeCtrl::saveDraft(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    auto tenant = tenantId(req);

    int accountId = body->get("accountId", 0).asInt();
    std::string subject = body->get("subject", "").asString();
    std::string from = body->get("from", "").asString();
    std::string to = body->get("to", "").asString();
    std::string cc = body->get("cc", "").asString();
    std::string bodyText = body->get("body", "").asString();
    std::string bodyHtml = body->get("bodyHtml", "").asString();

    db()->execSqlAsync(
        std::string("INSERT INTO email_messages (account_id, tenant_id, folder, "
                    "subject, from_address, to_addresses, cc_addresses, "
                    "body_text, body_html, is_draft) VALUES "
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
