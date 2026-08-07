#pragma once

#include <string>

namespace email_backend {

struct MimeMessage {
    std::string from;
    std::string to;
    std::string subject;
    std::string cc;       // optional, empty = omit
    std::string replyTo;  // optional, empty = omit
    std::string bodyText;
    std::string bodyHtml; // optional; when set, builds multipart/alternative
};

/// Builds a full RFC822 message (headers + body) ready for SMTP DATA
/// upload.
std::string buildMimeMessage(const MimeMessage& msg,
                              const std::string& boundary);

} // namespace email_backend
