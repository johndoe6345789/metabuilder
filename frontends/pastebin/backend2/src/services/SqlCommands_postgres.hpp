#pragma once

#include "SqlCommand.hpp"

#include <string>

namespace pastebin {

/// Builds the container command for the sql-postgres runner: initializes
/// and starts a throwaway postgres cluster inside the container, then
/// runs the SQL against it via psql.
SqlCommand buildPostgresCommand(const std::string& sqlBase64);

} // namespace pastebin
