#pragma once

#include "SqlCommand.hpp"

#include <string>

namespace pastebin {

/// Builds the container command for the sql-mysql runner: starts a
/// throwaway mysqld inside the container, waits for it to accept
/// connections, then runs the SQL against it.
SqlCommand buildMysqlCommand(const std::string& sqlBase64);

} // namespace pastebin
