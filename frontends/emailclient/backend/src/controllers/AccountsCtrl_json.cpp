#include "AccountsCtrl_json.hpp"

namespace email_backend {

namespace {

Json::Value optionalBigint(const nlohmann::json& entity, const char* key) {
    if (!entity.contains(key) || entity[key].is_null())
        return Json::Value();
    return Json::Value(static_cast<Json::Int64>(entity[key].get<long long>()));
}

} // namespace

Json::Value accountToJson(const nlohmann::json& entity) {
    Json::Value o;
    o["id"] = entity.value("id", "");
    o["tenantId"] = entity.value("tenantId", "");
    o["accountName"] = entity.value("accountName", "");
    o["emailAddress"] = entity.value("emailAddress", "");
    o["protocol"] = entity.value("protocol", "imap");
    o["hostname"] = entity.value("hostname", "");
    o["port"] = intFromJson(entity, "port", 0);
    o["encryption"] = entity.value("encryption", "tls");
    o["username"] = entity.value("username", "");
    o["smtpHost"] = entity.value("smtpHost", "");
    o["smtpPort"] = intFromJson(entity, "smtpPort", 0);
    o["smtpEncryption"] = entity.value("smtpEncryption", "tls");
    o["smtpUsername"] = entity.value("smtpUsername", "");
    o["isSyncEnabled"] = entity.value("isSyncEnabled", true);
    o["syncInterval"] = intFromJson(entity, "syncInterval", 300);
    o["lastSyncAt"] = optionalBigint(entity, "lastSyncAt");
    o["isSyncing"] = entity.value("isSyncing", false);
    o["isEnabled"] = entity.value("isEnabled", true);
    o["createdAt"] = optionalBigint(entity, "createdAt");
    o["updatedAt"] = optionalBigint(entity, "updatedAt");
    return o;
}

} // namespace email_backend
