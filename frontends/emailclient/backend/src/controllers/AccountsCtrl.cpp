#include "AccountsCtrl.h"
#include "Helpers.hpp"
#include "../services/Db.hpp"

#include <optional>

namespace email_backend {

namespace {

const char* kAccountColumns =
    "id, tenant_id, account_name, email_address, imap_host, imap_port, "
    "imap_encryption, smtp_host, smtp_port, smtp_encryption, last_sync_at, "
    "sync_status, created_at, updated_at";

// Optional host fields are stored as "" when unset (see create()) and
// surfaced back as JSON null, matching the old Flask API.
Json::Value optionalString(const std::string& v) {
    return v.empty() ? Json::Value() : Json::Value(v);
}

Json::Value accountToJson(const drogon::orm::Row& row) {
    Json::Value o;
    o["id"] = row["id"].as<int>();
    o["tenantId"] = row["tenant_id"].as<std::string>();
    o["accountName"] = row["account_name"].as<std::string>();
    o["emailAddress"] = row["email_address"].as<std::string>();
    o["imapHost"] = optionalString(row["imap_host"].as<std::string>());
    o["imapPort"] = row["imap_port"].as<int>();
    o["imapEncryption"] = row["imap_encryption"].as<std::string>();
    o["smtpHost"] = optionalString(row["smtp_host"].as<std::string>());
    o["smtpPort"] = row["smtp_port"].as<int>();
    o["smtpEncryption"] = row["smtp_encryption"].as<std::string>();
    o["lastSyncAt"] = row["last_sync_at"].isNull()
                           ? Json::Value()
                           : Json::Value(pgTsToIso(row["last_sync_at"].as<std::string>()));
    o["syncStatus"] = row["sync_status"].as<std::string>();
    o["createdAt"] = pgTsToIso(row["created_at"].as<std::string>());
    o["updatedAt"] = pgTsToIso(row["updated_at"].as<std::string>());
    return o;
}

} // namespace

void AccountsCtrl::list(const drogon::HttpRequestPtr& req,
                         std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    auto tenant = tenantId(req);
    db()->execSqlAsync(
        std::string("SELECT ") + kAccountColumns +
            " FROM email_accounts WHERE tenant_id = $1 ORDER BY id",
        [cb](const drogon::orm::Result& r) {
            Json::Value out(Json::arrayValue);
            for (const auto& row : r)
                out.append(accountToJson(row));
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        tenant);
}

void AccountsCtrl::create(const drogon::HttpRequestPtr& req,
                           std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    auto tenant = tenantId(req);

    std::string accountName = body->get("accountName", "").asString();
    std::string emailAddress = body->get("emailAddress", "").asString();
    std::string imapHost = body->get("imapHost", "").asString();
    int imapPort = body->get("imapPort", 993).asInt();
    std::string imapEncryption = body->get("imapEncryption", "tls").asString();
    std::string imapUsername = body->get("imapUsername", "").asString();
    std::string imapPassword = body->get("imapPassword", "").asString();
    std::string smtpHost = body->get("smtpHost", "").asString();
    int smtpPort = body->get("smtpPort", 587).asInt();
    std::string smtpEncryption = body->get("smtpEncryption", "tls").asString();
    std::string smtpUsername = body->get("smtpUsername", "").asString();
    std::string smtpPassword = body->get("smtpPassword", "").asString();

    db()->execSqlAsync(
        std::string("INSERT INTO email_accounts (tenant_id, account_name, "
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
        tenant, accountName, emailAddress, imapHost, imapPort, imapEncryption,
        imapUsername, imapPassword, smtpHost, smtpPort, smtpEncryption,
        smtpUsername, smtpPassword);
}

void AccountsCtrl::get(const drogon::HttpRequestPtr& req,
                        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                        const std::string& id) {
    auto idOpt = parseId(id);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    auto tenant = tenantId(req);
    db()->execSqlAsync(
        std::string("SELECT ") + kAccountColumns +
            " FROM email_accounts WHERE id = $1 AND tenant_id = $2",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            cb(jsonResponse(accountToJson(r[0])));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

void AccountsCtrl::remove(const drogon::HttpRequestPtr& req,
                           std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                           const std::string& id) {
    auto idOpt = parseId(id);
    if (!idOpt) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    auto tenant = tenantId(req);
    db()->execSqlAsync(
        "DELETE FROM email_accounts WHERE id = $1 AND tenant_id = $2 RETURNING id",
        [cb](const drogon::orm::Result& r) {
            if (r.empty()) {
                cb(errorResponse("Account not found", drogon::k404NotFound));
                return;
            }
            Json::Value out;
            out["deleted"] = true;
            cb(jsonResponse(out));
        },
        [cb](const drogon::orm::DrogonDbException& e) {
            cb(errorResponse(e.base().what(), drogon::k500InternalServerError));
        },
        *idOpt, tenant);
}

} // namespace email_backend
