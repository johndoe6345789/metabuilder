#pragma once

#include "../services/JsonConvert.hpp"

#include <json/json.h>
#include <nlohmann/json.hpp>

namespace email_backend {

/// Serializes a DBAL EmailClient entity into the HTTP response shape.
/// Deliberately never includes credentialId/smtpCredentialId -- those are
/// internal EncryptedSecret row ids, not returned to callers.
Json::Value accountToJson(const nlohmann::json& entity);

} // namespace email_backend
