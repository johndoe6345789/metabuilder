#pragma once

#include "../utils/http_client.h"
#include <string>
#include <vector>

namespace commands {

/**
 * Handle package commands
 *
 * Usage:
 *   package list                         List available packages
 *   package run <pkg> <script> [args]    Run a Lua script from a package
 *   package generate <pkg_id>            Generate a new package (uses package_generator)
 *   package install <pkg_id>             Install a package via DBAL
 *   package uninstall <pkg_id>           Uninstall a package via DBAL
 *   package info <pkg_id>                Show package details from DBAL
 *   package search <query>               Search available packages
 */
int handle_package(const HttpClient &client, const std::vector<std::string>& args);

} // namespace commands
