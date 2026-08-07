#pragma once

#include <drogon/orm/Field.h>
#include <drogon/orm/Row.h>
#include <json/json.h>

namespace email_backend {

// Column list shared by every query that returns a full message record.
extern const char* kMessageColumns;

// Serializes one email_messages row into the JSON shape the old Flask API
// returned.
Json::Value messageToJson(const drogon::orm::Row& row);

} // namespace email_backend
