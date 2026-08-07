#include "ComposeCtrl_json.hpp"
#include "Helpers.hpp"

namespace email_backend {

const char* kMessageColumns =
    "id, account_id, message_id, uid, folder, subject, from_address, "
    "to_addresses, cc_addresses, bcc_addresses, body_text, body_html, "
    "has_attachments, is_read, is_starred, is_draft, date_sent, "
    "date_received";

namespace {

Json::Value optionalString(const drogon::orm::Field& f) {
    return f.isNull() ? Json::Value() : Json::Value(f.as<std::string>());
}

Json::Value optionalTimestamp(const drogon::orm::Field& f) {
    return f.isNull() ? Json::Value()
                       : Json::Value(pgTsToIso(f.as<std::string>()));
}

Json::Value optionalInt(const drogon::orm::Field& f) {
    return f.isNull() ? Json::Value() : Json::Value(f.as<int>());
}

} // namespace

Json::Value messageToJson(const drogon::orm::Row& row) {
    Json::Value o;
    o["id"] = row["id"].as<int>();
    o["accountId"] = row["account_id"].as<int>();
    o["messageId"] = optionalString(row["message_id"]);
    o["uid"] = optionalInt(row["uid"]);
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

} // namespace email_backend
