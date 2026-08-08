#pragma once

#include "Helpers.hpp"

#include <nlohmann/json.hpp>

#include <string>

namespace email_backend {

// Builds an SmtpConfig from the DBAL EmailClient entity (revealing
// smtpCredentialId just-in-time, never persisted or logged) and sends the
// message, invoking `cb` with either a success or error response.
void sendViaAccount(const nlohmann::json& account, const std::string& to,
                     const std::string& subject, const std::string& bodyText,
                     const std::string& bodyHtml, const std::string& cc,
                     const std::string& bcc, const std::string& replyTo,
                     const ResponseCb& cb);

} // namespace email_backend
