#pragma once

#include <curl/curl.h>
#include <nlohmann/json.hpp>

#include <string>

namespace email_backend {

std::string toUpperAscii(std::string s);

// Configures `curl` for `upperMethod`, attaching `bodyText` as the request
// body when `jsonBody` is non-null.
void applyHttpMethod(CURL* curl, const std::string& upperMethod,
                      const nlohmann::json* jsonBody,
                      const std::string& bodyText);

} // namespace email_backend
