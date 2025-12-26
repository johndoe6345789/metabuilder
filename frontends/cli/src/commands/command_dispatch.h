#pragma once

#include "../utils/http_client.h"
#include <string>
#include <vector>

namespace commands {

int dispatch(const HttpClient &client, const std::vector<std::string> &args);

} // namespace commands
