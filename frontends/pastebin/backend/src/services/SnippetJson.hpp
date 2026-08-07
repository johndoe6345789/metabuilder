#pragma once

#include <json/json.h>
#include <nlohmann/json.hpp>

#include <string>

namespace pastebin {

/// Normalizes a raw DBAL Snippet record to match the frontend JSON
/// contract: parses inputParameters/files back from their stored JSON-
/// string form, and coerces hasPreview/isTemplate to real booleans.
nlohmann::json normalizeSnippet(nlohmann::json data);

/// Builds a DBAL Snippet body from a request's JSON payload.
nlohmann::json buildSnippetBody(const Json::Value& data,
                                 const std::string& userId, bool includeId,
                                 bool includeCreated);

} // namespace pastebin
