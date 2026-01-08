#include "commands/command_dispatch.h"
#include "utils/http_client.h"

#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

int main(int argc, char **argv) {
  std::vector<std::string> args;
  args.reserve(std::max(0, argc - 1));
  for (int i = 1; i < argc; ++i) {
    args.emplace_back(argv[i]);
  }

  const char *env_base = std::getenv("METABUILDER_BASE_URL");
  const std::string base_url = env_base ? env_base : "http://localhost:3000";

  try {
    HttpClient client(base_url);
    return commands::dispatch(client, args);
  } catch (const std::exception &e) {
    std::cerr << "failed to create HTTP client: " << e.what() << '\n';
    return 1;
  }
}
