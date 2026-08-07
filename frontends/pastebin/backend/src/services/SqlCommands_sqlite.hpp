#pragma once

#include "SqlCommand.hpp"

#include <string>

namespace pastebin {

/// Builds the container command for the sql-sqlite runner: a small
/// Python script (bundled here as a string, run via `python3 -c`) that
/// executes the SQL in-memory and pretty-prints table output -- no
/// separate DB server process needed.
SqlCommand buildSqliteCommand(const std::string& sqlBase64);

} // namespace pastebin
