#pragma once

#include <drogon/orm/Field.h>
#include <drogon/orm/Row.h>
#include <json/json.h>

namespace email_backend {

// Column list shared by every query that returns a full account record.
extern const char* kAccountColumns;

// Serializes one email_accounts row into the JSON shape the old Flask API
// returned. Optional host fields are stored as "" when unset (see
// AccountsCtrl_create.cpp) and surfaced back as JSON null.
Json::Value accountToJson(const drogon::orm::Row& row);

} // namespace email_backend
