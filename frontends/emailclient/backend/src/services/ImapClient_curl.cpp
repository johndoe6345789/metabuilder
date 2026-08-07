#include "ImapClient_curl.hpp"

namespace email_backend {

std::string buildUrl(const ImapConfig& cfg, const std::string& mailboxPath) {
    const bool implicitSsl = cfg.encryption == "tls";
    const std::string scheme = implicitSsl ? "imaps" : "imap";
    return scheme + "://" + cfg.host + ":" + std::to_string(cfg.port) + "/" +
           mailboxPath;
}

void applyAuth(CURL* curl, const ImapConfig& cfg) {
    curl_easy_setopt(curl, CURLOPT_USERNAME, cfg.username.c_str());
    curl_easy_setopt(curl, CURLOPT_PASSWORD, cfg.password.c_str());
    if (cfg.encryption == "starttls")
        curl_easy_setopt(curl, CURLOPT_USE_SSL,
                          static_cast<long>(CURLUSESSL_ALL));
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 15L);
}

} // namespace email_backend
