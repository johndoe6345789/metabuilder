#pragma once

#include <optional>
#include <string>

namespace email_backend {

/// Looks up the EmailFolder named `name` under `emailClientId` without
/// creating it. Returns nullopt if it doesn't exist (or on DBAL failure) --
/// use this for read-only paths that must not have create side effects.
std::optional<std::string> findFolder(const std::string& emailClientId,
                                       const std::string& name);

/// Returns the id of the EmailFolder named `name` under `emailClientId`,
/// creating it (with the given system `type`) if it doesn't exist yet.
/// Used for the well-known folders (Inbox, Drafts) that Sync/Compose need
/// a real EmailFolder row for. Returns nullopt on any DBAL failure.
std::optional<std::string> ensureFolder(const std::string& emailClientId,
                                         const std::string& name,
                                         const std::string& type);

} // namespace email_backend
