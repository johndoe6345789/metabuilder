#pragma once

#include "Helpers.hpp"

#include <drogon/orm/Field.h>
#include <drogon/orm/Row.h>

#include <string>

namespace email_backend {

// Builds an SmtpConfig from the account row (falling back to POSTFIX_HOST/
// PORT for unset fields) and sends the message, invoking `cb` with either
// a success or error response.
void sendViaAccount(const drogon::orm::Row& row, const std::string& to,
                     const std::string& subject, const std::string& bodyText,
                     const std::string& bodyHtml, const std::string& cc,
                     const std::string& bcc, const std::string& replyTo,
                     const ResponseCb& cb);

} // namespace email_backend
