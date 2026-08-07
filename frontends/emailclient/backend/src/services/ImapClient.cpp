#include "ImapClient.hpp"

#include <curl/curl.h>

#include <stdexcept>

namespace email_backend {

namespace {

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

std::string buildUrl(const ImapConfig& cfg, const std::string& mailboxPath) {
    bool implicitSsl = cfg.encryption == "tls";
    std::string scheme = implicitSsl ? "imaps" : "imap";
    return scheme + "://" + cfg.host + ":" + std::to_string(cfg.port) + "/" + mailboxPath;
}

struct CurlHandle {
    CURL* curl;
    CurlHandle() : curl(curl_easy_init()) {
        if (!curl)
            throw std::runtime_error("curl_easy_init failed");
    }
    ~CurlHandle() { curl_easy_cleanup(curl); }
    CurlHandle(const CurlHandle&) = delete;
    CurlHandle& operator=(const CurlHandle&) = delete;
};

void applyAuth(CURL* curl, const ImapConfig& cfg) {
    curl_easy_setopt(curl, CURLOPT_USERNAME, cfg.username.c_str());
    curl_easy_setopt(curl, CURLOPT_PASSWORD, cfg.password.c_str());
    if (cfg.encryption == "starttls")
        curl_easy_setopt(curl, CURLOPT_USE_SSL, static_cast<long>(CURLUSESSL_ALL));
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 15L);
}

} // namespace

ImapClient::ImapClient(ImapConfig config) : config_(std::move(config)) {}

std::vector<ImapListEntry> ImapClient::listFolders() {
    CurlHandle h;
    std::string url = buildUrl(config_, "");
    std::string response;

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    applyAuth(h.curl, config_);
    curl_easy_setopt(h.curl, CURLOPT_CUSTOMREQUEST, "LIST \"\" \"*\"");
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("IMAP LIST failed: ") + curl_easy_strerror(res));

    std::vector<ImapListEntry> out;
    size_t pos = 0;
    while (pos < response.size()) {
        size_t nl = response.find('\n', pos);
        std::string line = response.substr(
            pos, nl == std::string::npos ? std::string::npos : nl - pos);
        if (auto e = parseImapListLine(line))
            out.push_back(*e);
        if (nl == std::string::npos)
            break;
        pos = nl + 1;
    }
    return out;
}

std::vector<FetchedMessage> ImapClient::fetchNew(long lastUid) {
    CurlHandle h;
    std::string url = buildUrl(config_, "INBOX");
    std::string range = lastUid > 0 ? (std::to_string(lastUid + 1) + ":*") : "1:*";
    std::string cmd = "UID FETCH " + range + " (FLAGS BODY.PEEK[HEADER] BODY.PEEK[TEXT])";
    std::string response;

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    applyAuth(h.curl, config_);
    curl_easy_setopt(h.curl, CURLOPT_CUSTOMREQUEST, cmd.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 60L);

    CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("IMAP FETCH failed: ") + curl_easy_strerror(res));

    return parseFetchResponse(response);
}

} // namespace email_backend
