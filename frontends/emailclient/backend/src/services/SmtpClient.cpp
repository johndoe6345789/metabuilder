#include "SmtpClient.hpp"
#include "../util.hpp"

#include <curl/curl.h>

#include <cstring>
#include <random>
#include <sstream>
#include <stdexcept>

namespace email_backend {

namespace {

struct UploadState {
    std::string data;
    size_t offset = 0;
};

size_t readFromString(char* buffer, size_t size, size_t nitems, void* userdata) {
    auto* state = static_cast<UploadState*>(userdata);
    size_t room = size * nitems;
    size_t remaining = state->data.size() - state->offset;
    size_t n = remaining < room ? remaining : room;
    if (n > 0) {
        std::memcpy(buffer, state->data.data() + state->offset, n);
        state->offset += n;
    }
    return n;
}

std::string randomBoundary() {
    static thread_local std::mt19937_64 rng{std::random_device{}()};
    std::ostringstream out;
    out << "metabuilder-" << std::hex << rng();
    return out.str();
}

} // namespace

SmtpClient::SmtpClient(SmtpConfig config) : config_(std::move(config)) {}

void SmtpClient::send(const OutgoingEmail& email) {
    CURL* curl = curl_easy_init();
    if (!curl)
        throw std::runtime_error("curl_easy_init failed");

    MimeMessage mime;
    mime.from = email.from;
    mime.to = email.to;
    mime.cc = email.cc;
    mime.replyTo = email.replyTo;
    mime.subject = email.subject;
    mime.bodyText = email.bodyText;
    mime.bodyHtml = email.bodyHtml;

    UploadState state{buildMimeMessage(mime, randomBoundary()), 0};

    bool implicitSsl = config_.encryption == "ssl";
    std::string scheme = implicitSsl ? "smtps" : "smtp";
    std::string url = scheme + "://" + config_.host + ":" + std::to_string(config_.port) + "/";
    std::string mailFrom = "<" + email.from + ">";

    curl_slist* recipients = nullptr;
    std::vector<std::string> allRecipients = splitAddressList(email.to);
    for (auto& a : splitAddressList(email.cc))
        allRecipients.push_back(a);
    for (auto& a : splitAddressList(email.bcc))
        allRecipients.push_back(a);
    for (auto& addr : allRecipients)
        recipients = curl_slist_append(recipients, addr.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_FROM, mailFrom.c_str());
    curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);
    if (!config_.username.empty()) {
        curl_easy_setopt(curl, CURLOPT_USERNAME, config_.username.c_str());
        curl_easy_setopt(curl, CURLOPT_PASSWORD, config_.password.c_str());
    }
    if (config_.encryption == "tls")
        curl_easy_setopt(curl, CURLOPT_USE_SSL, static_cast<long>(CURLUSESSL_ALL));
    curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, readFromString);
    curl_easy_setopt(curl, CURLOPT_READDATA, &state);
    curl_easy_setopt(curl, CURLOPT_INFILESIZE_LARGE,
                      static_cast<curl_off_t>(state.data.size()));
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 15L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);

    CURLcode res = curl_easy_perform(curl);
    curl_slist_free_all(recipients);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK)
        throw std::runtime_error(std::string("SMTP send failed: ") + curl_easy_strerror(res));
}

} // namespace email_backend
