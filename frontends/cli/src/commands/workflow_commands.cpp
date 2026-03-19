/**
 * @file workflow_commands.cpp
 * @brief Workflow command handler implementations
 */

#include "workflow_commands.h"
#include <cpr/cpr.h>
#include <nlohmann/json.hpp>

#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>

using json = nlohmann::json;

namespace {

void print_response(const cpr::Response &response) {
  std::cout << "status: " << response.status_code << '\n';
  if (response.error) {
    std::cout << "error: " << response.error.message << '\n';
  }
  std::cout << response.text << '\n';
}

/**
 * @brief Print a formatted table row with fixed column widths
 */
void print_table_row(const std::string &id, const std::string &name,
                     const std::string &status, const std::string &version) {
  std::cout << "  " << std::left << std::setw(26) << id << std::setw(30)
            << name << std::setw(12) << status << version << '\n';
}

/**
 * @brief Print workflow list as a formatted table
 */
void print_workflow_table(const cpr::Response &response) {
  if (response.status_code != 200) {
    print_response(response);
    return;
  }

  try {
    auto data = json::parse(response.text);

    // Handle both array and { data: [...] } shapes
    json items;
    if (data.is_array()) {
      items = data;
    } else if (data.contains("data") && data["data"].is_array()) {
      items = data["data"];
    } else {
      // Single object or unexpected shape — fall back to raw output
      print_response(response);
      return;
    }

    if (items.empty()) {
      std::cout << "No workflows found.\n";
      return;
    }

    // Header
    std::cout << '\n';
    print_table_row("ID", "NAME", "STATUS", "VERSION");
    std::cout << "  " << std::string(78, '-') << '\n';

    for (const auto &wf : items) {
      std::string id = wf.value("id", wf.value("workflowId", "-"));
      std::string name = wf.value("name", wf.value("title", "-"));
      std::string status = wf.value("status", wf.value("state", "-"));
      std::string version = wf.value("version", "-");
      print_table_row(id, name, status, version);
    }

    std::cout << '\n' << items.size() << " workflow(s) found.\n";
  } catch (const json::exception &) {
    // JSON parse failed — show raw response
    print_response(response);
  }
}

/**
 * @brief Pretty-print a single workflow as indented JSON
 */
void print_workflow_detail(const cpr::Response &response) {
  if (response.status_code != 200) {
    print_response(response);
    return;
  }

  try {
    auto data = json::parse(response.text);
    std::cout << data.dump(2) << '\n';
  } catch (const json::exception &) {
    print_response(response);
  }
}

/**
 * @brief Print workflow execution result with status indicator
 */
void print_run_result(const cpr::Response &response) {
  std::cout << "status: " << response.status_code << '\n';

  if (response.error) {
    std::cout << "error: " << response.error.message << '\n';
    return;
  }

  try {
    auto data = json::parse(response.text);

    std::string state = data.value("status", data.value("state", "unknown"));
    std::string exec_id =
        data.value("executionId", data.value("id", "unknown"));

    if (state == "completed" || state == "success") {
      std::cout << "[OK] Workflow executed successfully\n";
    } else if (state == "running" || state == "pending") {
      std::cout << "[..] Workflow execution started\n";
    } else {
      std::cout << "[!!] Workflow execution returned: " << state << '\n';
    }

    std::cout << "  execution-id: " << exec_id << '\n';

    if (data.contains("output")) {
      std::cout << "  output: " << data["output"].dump(2) << '\n';
    }

    if (data.contains("error")) {
      std::cout << "  error: " << data["error"].dump() << '\n';
    }
  } catch (const json::exception &) {
    std::cout << response.text << '\n';
  }
}

int workflow_list(const HttpClient &client) {
  print_workflow_table(client.get("/api/dbal/workflow"));
  return 0;
}

int workflow_get(const HttpClient &client,
                 const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: workflow get <id>\n";
    std::cout << "Example: workflow get wf_user_created\n";
    return 1;
  }

  print_workflow_detail(client.get("/api/dbal/workflow/" + args[2]));
  return 0;
}

int workflow_run(const HttpClient &client,
                 const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout
        << "Usage: workflow run <id> [param=value ...]\n"
        << "Example: workflow run wf_user_created userId=clx123 tenant=acme\n";
    return 1;
  }

  std::string id = args[2];

  // Build input params from remaining key=value pairs
  std::ostringstream body;
  body << "{\"workflowId\":\"" << id << "\"";

  if (args.size() > 3) {
    body << ",\"input\":{";
    bool first = true;
    for (size_t i = 3; i < args.size(); ++i) {
      auto eq_pos = args[i].find('=');
      if (eq_pos == std::string::npos)
        continue;

      if (!first)
        body << ",";
      first = false;

      std::string key = args[i].substr(0, eq_pos);
      std::string value = args[i].substr(eq_pos + 1);

      // Simple type detection (matches dbal_commands pattern)
      if (value == "true" || value == "false" ||
          (value.find_first_not_of("0123456789.-") == std::string::npos &&
           !value.empty())) {
        body << "\"" << key << "\":" << value;
      } else {
        body << "\"" << key << "\":\"" << value << "\"";
      }
    }
    body << "}";
  }

  body << "}";

  std::cout << "Running workflow: " << id << "\n";
  print_run_result(
      client.post("/api/dbal/workflow/" + id + "/execute", body.str()));
  return 0;
}

int workflow_create(const HttpClient &client,
                    const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: workflow create <file.json>\n";
    std::cout << "Example: workflow create my_workflow.json\n";
    return 1;
  }

  std::string filepath = args[2];

  std::ifstream file(filepath);
  if (!file.is_open()) {
    std::cerr << "Error: Could not open file: " << filepath << "\n";
    return 1;
  }

  // Read entire file
  std::string body((std::istreambuf_iterator<char>(file)),
                   std::istreambuf_iterator<char>());
  file.close();

  // Validate JSON before sending
  try {
    auto parsed = json::parse(body);
    // Re-serialize to ensure clean JSON
    body = parsed.dump();
  } catch (const json::exception &e) {
    std::cerr << "Error: Invalid JSON in " << filepath << "\n";
    std::cerr << "  " << e.what() << "\n";
    return 1;
  }

  std::cout << "Creating workflow from: " << filepath << "\n";
  print_workflow_detail(client.post("/api/dbal/workflow", body));
  return 0;
}

int workflow_status(const HttpClient &client,
                    const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: workflow status <execution-id>\n";
    return 1;
  }

  print_run_result(
      client.get("/api/dbal/workflow/executions/" + args[2]));
  return 0;
}

} // namespace

namespace commands {

void print_workflow_help() {
  std::cout << R"(Workflow Commands:
  workflow list                          List all workflows
  workflow get <id>                      Show workflow details (JSON)
  workflow run <id> [param=value ...]    Execute a workflow with optional input
  workflow create <file.json>            Create a workflow from a JSON file
  workflow status <execution-id>         Check execution status

Examples:
  workflow list
  workflow get wf_user_created
  workflow run wf_user_created userId=clx123 tenant=acme
  workflow create workflows/on_post_created.json
  workflow status exec_abc123
)";
}

int handle_workflow(const HttpClient &client,
                    const std::vector<std::string> &args) {
  if (args.size() < 2) {
    print_workflow_help();
    return 0;
  }

  std::string subcommand = args[1];

  if (subcommand == "list") {
    return workflow_list(client);
  }

  if (subcommand == "get") {
    return workflow_get(client, args);
  }

  if (subcommand == "run") {
    return workflow_run(client, args);
  }

  if (subcommand == "create") {
    return workflow_create(client, args);
  }

  if (subcommand == "status") {
    return workflow_status(client, args);
  }

  if (subcommand == "help" || subcommand == "-h" || subcommand == "--help") {
    print_workflow_help();
    return 0;
  }

  std::cout << "Unknown workflow subcommand: " << subcommand << "\n";
  print_workflow_help();
  return 1;
}

} // namespace commands
