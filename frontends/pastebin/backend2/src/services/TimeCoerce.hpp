#pragma once

#include <json/json.h>

#include <cstdint>

namespace pastebin {

/// Coerces a createdAt/updatedAt request field to epoch milliseconds.
/// Numbers pass through as-is; ISO-8601 strings ("YYYY-MM-DDTHH:MM:SS...",
/// assumed UTC) are parsed; anything else yields 0.
int64_t coerceEpochMillis(const Json::Value& v);

} // namespace pastebin
