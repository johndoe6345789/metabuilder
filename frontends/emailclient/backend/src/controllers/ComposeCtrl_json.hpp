#pragma once

#include <json/json.h>
#include <nlohmann/json.hpp>

namespace email_backend {

/// Serializes a DBAL EmailMessage entity into the HTTP response shape.
Json::Value messageToJson(const nlohmann::json& entity);

} // namespace email_backend
