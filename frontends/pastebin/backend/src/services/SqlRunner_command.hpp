#pragma once

#include "RunnerRegistry.hpp"
#include "SqlCommand.hpp"

#include <optional>

namespace pastebin {

/// Picks the right container command builder for `spec.sqlRunner`.
/// Returns nullopt for an unrecognized backend.
std::optional<SqlCommand> buildSqlCommand(const RunnerSpec& spec,
                                           const std::string& sqlBase64);

} // namespace pastebin
