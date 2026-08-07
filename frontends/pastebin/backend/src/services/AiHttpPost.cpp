#include "AiHttpPost.hpp"

#include <curl/curl.h>

#include <utility>

namespace pastebin {

RawHttpResponse httpPostJson(const std::string& url, const CurlSlist& headers,
                              const std::string& bodyText) {
    CurlHandle h;
    std::string response;
    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_POST, 1L);
    curl_easy_setopt(h.curl, CURLOPT_POSTFIELDS, bodyText.c_str());
    curl_easy_setopt(h.curl, CURLOPT_POSTFIELDSIZE,
                      static_cast<long>(bodyText.size()));
    curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers.list);
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    RawHttpResponse out;
    if (curl_easy_perform(h.curl) == CURLE_OK)
        curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &out.status);
    out.body = std::move(response);
    return out;
}

} // namespace pastebin
