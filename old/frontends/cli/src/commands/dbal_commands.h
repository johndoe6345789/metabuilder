/**
 * @file dbal_commands.h
 * @brief DBAL command handlers for CLI
 * 
 * Provides CLI commands for DBAL operations:
 * - dbal ping        Check DBAL connection
 * - dbal create      Create a record
 * - dbal read        Read a record  
 * - dbal update      Update a record
 * - dbal delete      Delete a record
 * - dbal list        List records with filters
 * - dbal execute     Execute raw DBAL query
 */

#ifndef DBAL_COMMANDS_H
#define DBAL_COMMANDS_H

#include "../utils/http_client.h"
#include <string>
#include <vector>

namespace commands {

/**
 * @brief Handle DBAL-related commands
 * @param client HTTP client instance
 * @param args Command arguments (first element is "dbal")
 * @return Exit code (0 = success)
 */
int handle_dbal(const HttpClient &client, const std::vector<std::string> &args);

/**
 * @brief Print DBAL command help
 */
void print_dbal_help();

} // namespace commands

#endif // DBAL_COMMANDS_H
