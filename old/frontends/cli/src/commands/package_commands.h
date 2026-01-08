#pragma once

#include <string>
#include <vector>

namespace commands {

/**
 * Handle package commands
 * 
 * Usage:
 *   package list                    List available packages
 *   package run <pkg> <script> [args]   Run a Lua script from a package
 *   package generate <pkg_id>       Generate a new package (uses package_generator)
 */
int handle_package(const std::vector<std::string>& args);

} // namespace commands
