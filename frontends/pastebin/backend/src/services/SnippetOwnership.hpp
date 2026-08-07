#pragma once

#include <nlohmann/json.hpp>

#include <optional>
#include <string>

namespace pastebin {

/// Fetches a Snippet by id and returns its raw DBAL record only if it
/// exists and is owned by `userId`; nullopt otherwise (not found or not
/// owned are indistinguishable to the caller, matching the old Flask
/// routes' "Snippet not found" response for both cases).
std::optional<nlohmann::json> getOwnedSnippet(const std::string& id,
                                               const std::string& userId);

} // namespace pastebin
