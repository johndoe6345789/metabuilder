#include "ImapClient.hpp"
#include "ImapClient_curl.hpp"

#include <stdexcept>

namespace email_backend {

ImapClient::ImapClient(ImapConfig config) : config_(std::move(config)) {}

std::vector<ImapListEntry> ImapClient::listFolders() {
    CurlHandle h;
    const std::string url = buildUrl(config_, "");
    std::string response;

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    applyAuth(h.curl, config_);
    curl_easy_setopt(h.curl, CURLOPT_CUSTOMREQUEST, "LIST \"\" \"*\"");
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    const CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("IMAP LIST failed: ") +
                                  curl_easy_strerror(res));

    std::vector<ImapListEntry> out;
    size_t pos = 0;
    while (pos < response.size()) {
        const size_t nl = response.find('\n', pos);
        const std::string line = response.substr(
            pos, nl == std::string::npos ? std::string::npos : nl - pos);
        if (auto e = parseImapListLine(line))
            out.push_back(*e);
        if (nl == std::string::npos)
            break;
        pos = nl + 1;
    }
    return out;
}

} // namespace email_backend
