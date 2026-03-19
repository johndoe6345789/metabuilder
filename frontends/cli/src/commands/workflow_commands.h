/**
 * @file workflow_commands.h
 * @brief Workflow command handlers for CLI
 *
 * Provides CLI commands for workflow operations:
 * - workflow list              List all workflows
 * - workflow get <id>          Show workflow details
 * - workflow run <id>          Execute a workflow
 * - workflow create <file>     Create workflow from JSON file
 */

#ifndef WORKFLOW_COMMANDS_H
#define WORKFLOW_COMMANDS_H

#include "../utils/http_client.h"
#include <string>
#include <vector>

namespace commands {

/**
 * @brief Handle workflow-related commands
 * @param client HTTP client instance
 * @param args Command arguments (first element is "workflow")
 * @return Exit code (0 = success)
 */
int handle_workflow(const HttpClient &client, const std::vector<std::string> &args);

/**
 * @brief Print workflow command help
 */
void print_workflow_help();

} // namespace commands

#endif // WORKFLOW_COMMANDS_H
