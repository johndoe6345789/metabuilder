#pragma once

#include "CurlHandle.hpp"

#include <string>

namespace dockerterminal {

/// Performs one HTTP request against the Docker Engine API over its Unix
/// socket. `jsonBody` is sent as a JSON POST body when non-null.
std::string dockerRequest(const std::string& socketPath,
                           const std::string& path,
                           const std::string* jsonBody = nullptr);

} // namespace dockerterminal
