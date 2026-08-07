#include "util_mime.hpp"

#include <sstream>

namespace email_backend {

std::string buildMimeMessage(const MimeMessage& msg,
                              const std::string& boundary) {
    std::ostringstream out;
    out << "From: " << msg.from << "\r\n";
    out << "To: " << msg.to << "\r\n";
    if (!msg.cc.empty())
        out << "Cc: " << msg.cc << "\r\n";
    if (!msg.replyTo.empty())
        out << "Reply-To: " << msg.replyTo << "\r\n";
    out << "Subject: " << msg.subject << "\r\n";
    out << "MIME-Version: 1.0\r\n";

    if (!msg.bodyHtml.empty()) {
        out << "Content-Type: multipart/alternative; boundary=\"" << boundary
            << "\"\r\n\r\n";
        out << "--" << boundary << "\r\n";
        out << "Content-Type: text/plain; charset=utf-8\r\n\r\n";
        out << msg.bodyText << "\r\n\r\n";
        out << "--" << boundary << "\r\n";
        out << "Content-Type: text/html; charset=utf-8\r\n\r\n";
        out << msg.bodyHtml << "\r\n\r\n";
        out << "--" << boundary << "--\r\n";
    } else {
        out << "Content-Type: text/plain; charset=utf-8\r\n\r\n";
        out << msg.bodyText << "\r\n";
    }
    return out.str();
}

} // namespace email_backend
