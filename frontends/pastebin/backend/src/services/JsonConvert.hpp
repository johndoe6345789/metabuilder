#pragma once

#include <json/json.h>
#include <nlohmann/json.hpp>

namespace pastebin {

/// Converts an arbitrary nlohmann::json value (as returned by DBAL) into
/// the jsoncpp Json::Value Drogon's HTTP responses use.
Json::Value nlohmannToJsoncpp(const nlohmann::json& in);

} // namespace pastebin
