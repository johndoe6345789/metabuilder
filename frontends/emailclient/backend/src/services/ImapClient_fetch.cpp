#include "ImapClient.hpp"
#include "ImapClient_curl.hpp"

#include <stdexcept>

namespace email_backend {

std::vector<FetchedMessage> ImapClient::fetchNew(long lastUid) {
    CurlHandle h;
    const std::string url = buildUrl(config_, "INBOX");
    const std::string range =
        lastUid > 0 ? (std::to_string(lastUid + 1) + ":*") : "1:*";
    const std::string cmd =
        "UID FETCH " + range + " (FLAGS BODY.PEEK[HEADER] BODY.PEEK[TEXT])";
    std::string response;

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    applyAuth(h.curl, config_);
    curl_easy_setopt(h.curl, CURLOPT_CUSTOMREQUEST, cmd.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 60L);

    const CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("IMAP FETCH failed: ") +
                                  curl_easy_strerror(res));

    return parseFetchResponse(response);
}

} // namespace email_backend
