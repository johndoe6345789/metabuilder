#include "DockerHttp.hpp"

#include <stdexcept>

namespace dockerterminal {

std::string dockerRequest(const std::string& socketPath,
                           const std::string& path,
                           const std::string* jsonBody) {
    CurlHandle h;
    const std::string url = "http://localhost" + path;
    std::string response;
    struct curl_slist* headers = nullptr;

    curl_easy_setopt(h.curl, CURLOPT_UNIX_SOCKET_PATH, socketPath.c_str());
    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 30L);

    if (jsonBody) {
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(h.curl, CURLOPT_POSTFIELDS, jsonBody->c_str());
        curl_easy_setopt(h.curl, CURLOPT_POSTFIELDSIZE,
                          static_cast<long>(jsonBody->size()));
    }

    const CURLcode res = curl_easy_perform(h.curl);
    if (headers)
        curl_slist_free_all(headers);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("Docker API request failed: ") +
                                  curl_easy_strerror(res));

    long status = 0;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &status);
    if (status >= 400)
        throw std::runtime_error("Docker API returned HTTP " +
                                  std::to_string(status) + ": " + response);

    return response;
}

} // namespace dockerterminal
