#include "SmtpClient.hpp"
#include "CurlHandle.hpp"
#include "SmtpClient_upload.hpp"
#include "../util_address.hpp"
#include "../util_mime.hpp"

#include <stdexcept>

namespace email_backend {

namespace {

std::vector<std::string> collectRecipients(const OutgoingEmail& email) {
    std::vector<std::string> all = splitAddressList(email.to);
    for (const auto& a : splitAddressList(email.cc))
        all.push_back(a);
    for (const auto& a : splitAddressList(email.bcc))
        all.push_back(a);
    return all;
}

} // namespace

SmtpClient::SmtpClient(SmtpConfig config) : config_(std::move(config)) {}

void SmtpClient::send(const OutgoingEmail& email) {
    CurlHandle h;

    MimeMessage mime;
    mime.from = email.from;
    mime.to = email.to;
    mime.cc = email.cc;
    mime.replyTo = email.replyTo;
    mime.subject = email.subject;
    mime.bodyText = email.bodyText;
    mime.bodyHtml = email.bodyHtml;
    UploadState state{buildMimeMessage(mime, randomBoundary()), 0};

    const bool implicitSsl = config_.encryption == "ssl";
    const std::string scheme = implicitSsl ? "smtps" : "smtp";
    const std::string url = scheme + "://" + config_.host + ":" +
                             std::to_string(config_.port) + "/";
    const std::string mailFrom = "<" + email.from + ">";

    CurlSlist recipients;
    for (const auto& addr : collectRecipients(email))
        recipients.append(addr);

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_MAIL_FROM, mailFrom.c_str());
    curl_easy_setopt(h.curl, CURLOPT_MAIL_RCPT, recipients.list);
    if (!config_.username.empty()) {
        curl_easy_setopt(h.curl, CURLOPT_USERNAME, config_.username.c_str());
        curl_easy_setopt(h.curl, CURLOPT_PASSWORD, config_.password.c_str());
    }
    if (config_.encryption == "tls")
        curl_easy_setopt(h.curl, CURLOPT_USE_SSL,
                          static_cast<long>(CURLUSESSL_ALL));
    curl_easy_setopt(h.curl, CURLOPT_UPLOAD, 1L);
    curl_easy_setopt(h.curl, CURLOPT_READFUNCTION, readFromString);
    curl_easy_setopt(h.curl, CURLOPT_READDATA, &state);
    curl_easy_setopt(h.curl, CURLOPT_INFILESIZE_LARGE,
                      static_cast<curl_off_t>(state.data.size()));
    curl_easy_setopt(h.curl, CURLOPT_CONNECTTIMEOUT, 15L);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    const CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("SMTP send failed: ") +
                                  curl_easy_strerror(res));
}

} // namespace email_backend
