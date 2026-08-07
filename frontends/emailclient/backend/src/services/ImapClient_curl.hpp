#pragma once

#include "CurlHandle.hpp"
#include "ImapClient.hpp"

namespace email_backend {

std::string buildUrl(const ImapConfig& cfg, const std::string& mailboxPath);
void applyAuth(CURL* curl, const ImapConfig& cfg);

} // namespace email_backend
