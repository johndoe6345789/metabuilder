#pragma once

#include <json/json.h>
#include <nlohmann/json.hpp>

namespace email_backend {

/// Converts an arbitrary nlohmann::json value (as returned by DBAL) into
/// the jsoncpp Json::Value Drogon's HTTP responses use.
Json::Value nlohmannToJsoncpp(const nlohmann::json& in);

/// Reads an int field from a DBAL entity, tolerating the sqlite adapter's
/// habit of round-tripping "int"-typed schema fields (e.g. EmailClient's
/// port/smtpPort/syncInterval) as JSON strings rather than numbers --
/// unlike "bigint" fields, which come back as real numbers. Falls back to
/// `fallback` if the field is absent, null, or unparseable.
int intFromJson(const nlohmann::json& entity, const char* key, int fallback);

} // namespace email_backend
