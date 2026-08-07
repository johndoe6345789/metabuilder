#pragma once

#include <string>

namespace email_backend {

struct SmtpConfig {
    std::string host;
    int port = 587;
    std::string encryption = "tls"; // "tls"/STARTTLS, "ssl"/implicit, "none"
    std::string username;
    std::string password;
};

struct OutgoingEmail {
    std::string from;
    std::string to;
    std::string cc;       // comma-separated, optional
    std::string bcc;      // comma-separated, optional
    std::string subject;
    std::string bodyText;
    std::string bodyHtml; // optional; sent as multipart/alternative when set
    std::string replyTo;  // optional
};

/// Thin libcurl wrapper for sending mail via SMTP (curl's native smtp(s)://
/// URL support handles the STARTTLS/AUTH exchange).
class SmtpClient {
  public:
    explicit SmtpClient(SmtpConfig config);

    /// Sends `email`. Throws std::runtime_error on failure.
    void send(const OutgoingEmail& email);

  private:
    SmtpConfig config_;
};

} // namespace email_backend
