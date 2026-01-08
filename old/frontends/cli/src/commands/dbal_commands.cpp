/**
 * @file dbal_commands.cpp
 * @brief DBAL command handler implementations
 */

#include "dbal_commands.h"
#include <cpr/cpr.h>
#include <iostream>
#include <sstream>

namespace {

void print_response(const cpr::Response &response) {
  std::cout << "status: " << response.status_code << '\n';
  if (response.error) {
    std::cout << "error: " << response.error.message << '\n';
  }
  std::cout << response.text << '\n';
}

/**
 * @brief Build JSON body from key=value pairs
 */
std::string build_json_body(const std::vector<std::string> &pairs) {
  if (pairs.empty()) {
    return "{}";
  }
  
  std::ostringstream json;
  json << "{";
  
  bool first = true;
  for (const auto &pair : pairs) {
    auto eq_pos = pair.find('=');
    if (eq_pos == std::string::npos) {
      continue;
    }
    
    if (!first) {
      json << ",";
    }
    first = false;
    
    std::string key = pair.substr(0, eq_pos);
    std::string value = pair.substr(eq_pos + 1);
    
    // Simple type detection
    if (value == "true" || value == "false" || 
        (value.find_first_not_of("0123456789.-") == std::string::npos && !value.empty())) {
      // Boolean or number - don't quote
      json << "\"" << key << "\":" << value;
    } else {
      // String - quote it
      json << "\"" << key << "\":\"" << value << "\"";
    }
  }
  
  json << "}";
  return json.str();
}

int dbal_ping(const HttpClient &client) {
  print_response(client.get("/api/dbal/ping"));
  return 0;
}

int dbal_create(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: dbal create <entity> <field=value> [field=value...]\n";
    std::cout << "Example: dbal create User name=John email=john@example.com level=1\n";
    return 1;
  }
  
  std::string entity = args[2];
  std::vector<std::string> fields(args.begin() + 3, args.end());
  std::string body = build_json_body(fields);
  
  std::cout << "Creating " << entity << " with: " << body << "\n";
  print_response(client.post("/api/dbal/" + entity, body));
  return 0;
}

int dbal_read(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() != 4) {
    std::cout << "Usage: dbal read <entity> <id>\n";
    std::cout << "Example: dbal read User clx123abc\n";
    return 1;
  }
  
  std::string entity = args[2];
  std::string id = args[3];
  
  print_response(client.get("/api/dbal/" + entity + "/" + id));
  return 0;
}

int dbal_update(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 4) {
    std::cout << "Usage: dbal update <entity> <id> <field=value> [field=value...]\n";
    std::cout << "Example: dbal update User clx123abc name=Jane level=2\n";
    return 1;
  }
  
  std::string entity = args[2];
  std::string id = args[3];
  std::vector<std::string> fields(args.begin() + 4, args.end());
  std::string body = build_json_body(fields);
  
  std::cout << "Updating " << entity << "/" << id << " with: " << body << "\n";
  print_response(client.patch("/api/dbal/" + entity + "/" + id, body));
  return 0;
}

int dbal_delete(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() != 4) {
    std::cout << "Usage: dbal delete <entity> <id>\n";
    std::cout << "Example: dbal delete User clx123abc\n";
    return 1;
  }
  
  std::string entity = args[2];
  std::string id = args[3];
  
  std::cout << "Deleting " << entity << "/" << id << "\n";
  print_response(client.del("/api/dbal/" + entity + "/" + id));
  return 0;
}

int dbal_list(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: dbal list <entity> [where.field=value] [take=N] [skip=N]\n";
    std::cout << "Example: dbal list User where.level=1 take=10\n";
    return 1;
  }
  
  std::string entity = args[2];
  
  // Build query parameters
  std::string query;
  for (size_t i = 3; i < args.size(); ++i) {
    auto eq_pos = args[i].find('=');
    if (eq_pos != std::string::npos) {
      if (!query.empty()) {
        query += "&";
      }
      query += args[i];
    }
  }
  
  std::string url = "/api/dbal/" + entity;
  if (!query.empty()) {
    url += "?" + query;
  }
  
  print_response(client.get(url));
  return 0;
}

int dbal_execute(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: dbal execute <operation> [params...]\n";
    std::cout << "Example: dbal execute findFirst entity=User where.email=admin@test.com\n";
    return 1;
  }
  
  std::string operation = args[2];
  std::vector<std::string> params(args.begin() + 3, args.end());
  
  // Build request body
  std::ostringstream body;
  body << "{\"operation\":\"" << operation << "\"";
  
  if (!params.empty()) {
    body << ",\"params\":" << build_json_body(params);
  }
  
  body << "}";
  
  std::cout << "Executing " << operation << "\n";
  print_response(client.post("/api/dbal/execute", body.str()));
  return 0;
}

int dbal_rest(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 5) {
    std::cout << "Usage: dbal rest <tenant> <package> <entity> [id] [method|action] [data...]\n";
    std::cout << "\nExamples:\n";
    std::cout << "  dbal rest acme forum_forge posts                    # GET list\n";
    std::cout << "  dbal rest acme forum_forge posts 123                # GET by id\n";
    std::cout << "  dbal rest acme forum_forge posts POST title=Hello   # POST create\n";
    std::cout << "  dbal rest acme forum_forge posts 123 PUT title=New  # PUT update\n";
    std::cout << "  dbal rest acme forum_forge posts 123 DELETE         # DELETE\n";
    std::cout << "  dbal rest acme forum_forge posts 123 like POST      # Custom action\n";
    return 1;
  }
  
  std::string tenant = args[2];
  std::string package = args[3];
  std::string entity = args[4];
  std::string id;
  std::string method = "GET";
  std::string action;
  std::vector<std::string> data_args;
  
  // Parse remaining arguments
  size_t i = 5;
  
  // Check if next arg is an ID (not a method)
  if (i < args.size()) {
    std::string arg = args[i];
    // If it's not a method keyword, treat as ID
    if (arg != "GET" && arg != "POST" && arg != "PUT" && arg != "PATCH" && arg != "DELETE") {
      id = arg;
      i++;
    }
  }
  
  // Check for method or action
  if (i < args.size()) {
    std::string arg = args[i];
    if (arg == "GET" || arg == "POST" || arg == "PUT" || arg == "PATCH" || arg == "DELETE") {
      method = arg;
      i++;
    } else if (!id.empty()) {
      // If we have an ID and this isn't a method, it might be an action
      action = arg;
      i++;
      // Check if next is a method
      if (i < args.size()) {
        arg = args[i];
        if (arg == "GET" || arg == "POST" || arg == "PUT" || arg == "PATCH" || arg == "DELETE") {
          method = arg;
          i++;
        }
      }
    }
  }
  
  // Remaining args are data
  while (i < args.size()) {
    data_args.push_back(args[i]);
    i++;
  }
  
  // Build URL
  std::string url = "/" + tenant + "/" + package + "/" + entity;
  if (!id.empty()) {
    url += "/" + id;
  }
  if (!action.empty()) {
    url += "/" + action;
  }
  
  std::cout << method << " " << url << "\n";
  
  // Build body if we have data
  std::string body;
  if (!data_args.empty()) {
    body = build_json_body(data_args);
    std::cout << "Body: " << body << "\n";
  }
  
  // Make request based on method
  if (method == "GET") {
    print_response(client.get(url));
  } else if (method == "POST") {
    print_response(client.post(url, body.empty() ? "{}" : body));
  } else if (method == "PUT") {
    print_response(client.put(url, body.empty() ? "{}" : body));
  } else if (method == "PATCH") {
    print_response(client.patch(url, body.empty() ? "{}" : body));
  } else if (method == "DELETE") {
    print_response(client.del(url));
  }
  
  return 0;
}

int dbal_schema(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 3) {
    std::cout << "Usage: dbal schema <subcommand>\n";
    std::cout << "  dbal schema list          List all registered schemas\n";
    std::cout << "  dbal schema pending       Show pending migrations\n";
    std::cout << "  dbal schema entity <name> Show schema for entity\n";
    std::cout << "  dbal schema scan          Scan packages for schema changes\n";
    std::cout << "  dbal schema approve <id>  Approve a migration (or 'all')\n";
    std::cout << "  dbal schema reject <id>   Reject a migration\n";
    std::cout << "  dbal schema generate      Generate Prisma fragment\n";
    return 1;
  }
  
  std::string subcommand = args[2];
  
  if (subcommand == "list") {
    print_response(client.get("/api/dbal/schema"));
    return 0;
  }
  
  if (subcommand == "pending") {
    print_response(client.get("/api/dbal/schema"));
    return 0;
  }
  
  if (subcommand == "entity" && args.size() >= 4) {
    print_response(client.get("/api/dbal/schema/" + args[3]));
    return 0;
  }
  
  if (subcommand == "scan") {
    std::cout << "Scanning packages for schema changes...\n";
    print_response(client.post("/api/dbal/schema", "{\"action\":\"scan\"}"));
    return 0;
  }
  
  if (subcommand == "approve" && args.size() >= 4) {
    std::string id = args[3];
    std::cout << "Approving migration: " << id << "\n";
    print_response(client.post("/api/dbal/schema", "{\"action\":\"approve\",\"id\":\"" + id + "\"}"));
    return 0;
  }
  
  if (subcommand == "reject" && args.size() >= 4) {
    std::string id = args[3];
    std::cout << "Rejecting migration: " << id << "\n";
    print_response(client.post("/api/dbal/schema", "{\"action\":\"reject\",\"id\":\"" + id + "\"}"));
    return 0;
  }
  
  if (subcommand == "generate") {
    std::cout << "Generating Prisma fragment from approved migrations...\n";
    print_response(client.post("/api/dbal/schema", "{\"action\":\"generate\"}"));
    return 0;
  }
  
  std::cout << "Unknown schema subcommand: " << subcommand << "\n";
  return 1;
}

} // namespace

namespace commands {

void print_dbal_help() {
  std::cout << R"(DBAL Commands:
  dbal ping                              Check DBAL connection
  dbal create <entity> <field=value...>  Create a new record
  dbal read <entity> <id>                Read a record by ID
  dbal update <entity> <id> <field=value...>  Update a record
  dbal delete <entity> <id>              Delete a record
  dbal list <entity> [filters...]        List records with optional filters
  dbal execute <operation> [params...]   Execute a DBAL operation

RESTful Multi-Tenant Operations:
  dbal rest <tenant> <package> <entity> [id] [action] [method] [data...]
    Examples:
      dbal rest acme forum_forge posts                    # GET - list posts
      dbal rest acme forum_forge posts 123                # GET - read post
      dbal rest acme forum_forge posts POST title=Hello   # POST - create
      dbal rest acme forum_forge posts 123 PUT title=New  # PUT - update
      dbal rest acme forum_forge posts 123 DELETE         # DELETE
      dbal rest acme forum_forge posts 123 like POST      # Custom action

Schema Management:
  dbal schema list                       List registered entity schemas
  dbal schema pending                    Show pending schema migrations
  dbal schema entity <name>              Show schema for an entity
  dbal schema scan                       Scan packages for schema changes
  dbal schema approve <id|all>           Approve a migration
  dbal schema reject <id>                Reject a migration
  dbal schema generate                   Generate Prisma fragment

Filter syntax for list:
  where.field=value    Filter by field value
  take=N               Limit results
  skip=N               Skip first N results
  orderBy.field=asc    Sort ascending
  orderBy.field=desc   Sort descending

Examples:
  dbal ping
  dbal create User name=Alice email=alice@test.com level=1
  dbal read User clx123abc
  dbal update User clx123abc level=2
  dbal list User where.level=1 take=10
  dbal list AuditLog where.entity=User orderBy.timestamp=desc take=20
  dbal delete User clx123abc
  dbal execute findFirst entity=User where.email=admin@test.com
)";
}

int handle_dbal(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 2) {
    print_dbal_help();
    return 0;
  }
  
  std::string subcommand = args[1];
  
  if (subcommand == "ping") {
    return dbal_ping(client);
  }
  
  if (subcommand == "create") {
    return dbal_create(client, args);
  }
  
  if (subcommand == "read") {
    return dbal_read(client, args);
  }
  
  if (subcommand == "update") {
    return dbal_update(client, args);
  }
  
  if (subcommand == "delete") {
    return dbal_delete(client, args);
  }
  
  if (subcommand == "list") {
    return dbal_list(client, args);
  }
  
  if (subcommand == "execute") {
    return dbal_execute(client, args);
  }
  
  if (subcommand == "rest") {
    return dbal_rest(client, args);
  }
  
  if (subcommand == "schema") {
    return dbal_schema(client, args);
  }
  
  if (subcommand == "help" || subcommand == "-h" || subcommand == "--help") {
    print_dbal_help();
    return 0;
  }
  
  std::cout << "Unknown DBAL subcommand: " << subcommand << "\n";
  print_dbal_help();
  return 1;
}

} // namespace commands
