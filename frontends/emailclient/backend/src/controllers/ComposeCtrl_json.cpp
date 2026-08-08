#include "ComposeCtrl_json.hpp"

namespace email_backend {

namespace {

// The sqlite adapter round-trips "json"-typed schema fields (to/cc/bcc) as
// a JSON-encoded string rather than a real array -- unlike int/bigint
// fields, which are inconsistent in the other direction (see
// JsonConvert::intFromJson). Accept both shapes defensively.
nlohmann::json resolveJsonArray(const nlohmann::json& entity,
                                 const char* key) {
    if (!entity.contains(key))
        return nlohmann::json::array();
    const auto& v = entity[key];
    if (v.is_array())
        return v;
    if (v.is_string()) {
        try {
            auto parsed = nlohmann::json::parse(v.get<std::string>());
            if (parsed.is_array())
                return parsed;
        } catch (const nlohmann::json::parse_error&) {
            // fall through
        }
    }
    return nlohmann::json::array();
}

Json::Value stringArray(const nlohmann::json& entity, const char* key) {
    Json::Value out(Json::arrayValue);
    for (const auto& v : resolveJsonArray(entity, key))
        if (v.is_string())
            out.append(v.get<std::string>());
    return out;
}

} // namespace

Json::Value messageToJson(const nlohmann::json& entity) {
    Json::Value o;
    o["id"] = entity.value("id", "");
    o["accountId"] = entity.value("emailClientId", "");
    o["folderId"] = entity.value("folderId", "");
    o["messageId"] = entity.value("messageId", "");
    o["subject"] = entity.value("subject", "");
    o["from"] = entity.value("from", "");
    o["to"] = stringArray(entity, "to");
    o["cc"] = stringArray(entity, "cc");
    o["bcc"] = stringArray(entity, "bcc");
    o["bodyText"] = entity.value("textBody", "");
    o["bodyHtml"] = entity.value("htmlBody", "");
    o["isRead"] = entity.value("isRead", false);
    o["isStarred"] = entity.value("isStarred", false);
    o["isDraft"] = entity.value("isDraft", false);
    o["receivedAt"] =
        static_cast<Json::Int64>(entity.value("receivedAt", 0LL));
    return o;
}

} // namespace email_backend
