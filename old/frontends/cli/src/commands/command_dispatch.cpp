#include "command_dispatch.h"
#include "dbal_commands.h"
#include "package_commands.h"

#include <cpr/cpr.h>
#include <iostream>

namespace {

void print_help() {
  std::cout << R"(Usage: metabuilder-cli <command> [options]
Available commands:
  auth session                    Show the current authentication session
  auth login <email> <password>   Authenticate with credentials
  user list                       List all users
  user get <userId>               Get a user by ID
  tenant list                     List all tenants
  tenant get <tenantId>           Get a tenant by ID
  dbal <subcommand>               DBAL operations (use 'dbal help' for details)
  package <subcommand>            Package operations (use 'package help' for details)
)";
}

void print_response(const cpr::Response &response) {
  std::cout << "status: " << response.status_code << '\n';
  if (response.error) {
    std::cout << "error: " << response.error.message << '\n';
  }
  std::cout << response.text << '\n';
}

int handle_auth(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 2) {
    std::cout << "auth command requires a subcommand\n";
    print_help();
    return 1;
  }

  if (args[1] == "session") {
    print_response(client.get("/api/auth/session"));
    return 0;
  }

  if (args[1] == "login") {
    if (args.size() != 4) {
      std::cout << "auth login requires email and password\n";
      return 1;
    }
    std::string body =
        "{\"email\":\"" + args[2] + "\",\"password\":\"" + args[3] + "\"}";
    print_response(client.post("/api/auth/login", body));
    return 0;
  }

  std::cout << "unknown auth subcommand\n";
  print_help();
  return 1;
}

int handle_user(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 2) {
    std::cout << "user command requires a subcommand\n";
    print_help();
    return 1;
  }

  if (args[1] == "list") {
    print_response(client.get("/api/users"));
    return 0;
  }

  if (args[1] == "get") {
    if (args.size() != 3) {
      std::cout << "user get requires a user ID\n";
      return 1;
    }
    print_response(client.get("/api/users/" + args[2]));
    return 0;
  }

  std::cout << "unknown user subcommand\n";
  print_help();
  return 1;
}

int handle_tenant(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.size() < 2) {
    std::cout << "tenant command requires a subcommand\n";
    print_help();
    return 1;
  }

  if (args[1] == "list") {
    print_response(client.get("/api/tenants"));
    return 0;
  }

  if (args[1] == "get") {
    if (args.size() != 3) {
      std::cout << "tenant get requires a tenant ID\n";
      return 1;
    }
    print_response(client.get("/api/tenants/" + args[2]));
    return 0;
  }

  std::cout << "unknown tenant subcommand\n";
  print_help();
  return 1;
}

} // namespace

namespace commands {

int dispatch(const HttpClient &client, const std::vector<std::string> &args) {
  if (args.empty()) {
    print_help();
    return 0;
  }

  if (args[0] == "auth") {
    return handle_auth(client, args);
  }

  if (args[0] == "user") {
    return handle_user(client, args);
  }

  if (args[0] == "tenant") {
    return handle_tenant(client, args);
  }

  if (args[0] == "dbal") {
    return handle_dbal(client, args);
  }

  if (args[0] == "package") {
    return handle_package(args);
  }

  print_help();
  return 1;
}

} // namespace commands
