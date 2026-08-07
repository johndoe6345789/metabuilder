#include "AccountsCtrl_json.hpp"
#include "Helpers.hpp"

namespace email_backend {

const char* kAccountColumns =
    "id, tenant_id, account_name, email_address, imap_host, imap_port, "
    "imap_encryption, smtp_host, smtp_port, smtp_encryption, last_sync_at, "
    "sync_status, created_at, updated_at";

namespace {

Json::Value optionalString(const std::string& v) {
    return v.empty() ? Json::Value() : Json::Value(v);
}

} // namespace

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
    o["lastSyncAt"] =
        row["last_sync_at"].isNull()
            ? Json::Value()
            : Json::Value(pgTsToIso(row["last_sync_at"].as<std::string>()));
    o["syncStatus"] = row["sync_status"].as<std::string>();
    o["createdAt"] = pgTsToIso(row["created_at"].as<std::string>());
    o["updatedAt"] = pgTsToIso(row["updated_at"].as<std::string>());
    return o;
}

} // namespace email_backend
