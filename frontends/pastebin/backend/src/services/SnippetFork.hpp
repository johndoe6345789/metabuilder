#pragma once

#include <nlohmann/json.hpp>

#include <string>
#include <utility>

namespace pastebin {

/// Copies `source` (a raw DBAL Snippet record) into `userId`'s account
/// under `newTitle`. Returns the normalized new snippet and an HTTP
/// status code (201 on success, 500 on failure).
std::pair<nlohmann::json, int> forkSnippet(const nlohmann::json& source,
                                            const std::string& newTitle,
                                            const std::string& userId);

} // namespace pastebin
