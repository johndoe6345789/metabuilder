#pragma once

#include <nlohmann/json.hpp>

#include <optional>
#include <string>

namespace pastebin {

/// Fetches a Namespace by id and returns its raw DBAL record only if it
/// exists and is owned by `userId`; nullopt otherwise.
std::optional<nlohmann::json> getOwnedNamespace(const std::string& id,
                                                 const std::string& userId);

} // namespace pastebin
