#include "DockerRequest.hpp"
#include "CurlHandle.hpp"
#include "../util.hpp"

#include <curl/curl.h>

#include <stdexcept>

namespace pastebin {

namespace {

void applyMethod(CURL* curl, const std::string& method,
                  const std::string* jsonBody) {
    if (jsonBody) {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonBody->c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE,
                          static_cast<long>(jsonBody->size()));
    }
    if (method == "GET") {
        curl_easy_setopt(curl, CURLOPT_HTTPGET, 1L);
    } else if (method == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        if (!jsonBody)
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, 0L);
    } else {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, method.c_str());
        if (jsonBody)
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
    }
}

} // namespace

DockerHttpResponse dockerRequest(const std::string& method,
                                  const std::string& path,
                                  const std::string* jsonBody,
                                  long timeoutSeconds) {
    const std::string socketPath =
        envOr("DOCKER_SOCKET", "/var/run/docker.sock");

    CurlHandle h;
    const std::string url = "http://localhost" + path;
    std::string response;

    curl_easy_setopt(h.curl, CURLOPT_UNIX_SOCKET_PATH, socketPath.c_str());
    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, timeoutSeconds);

    CurlSlist headers;
    if (jsonBody) {
        headers.append("Content-Type: application/json");
        curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers.list);
    }
    applyMethod(h.curl, method, jsonBody);

    const CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK)
        throw std::runtime_error(std::string("Docker API request failed: ") +
                                  curl_easy_strerror(res));

    DockerHttpResponse out;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &out.status);
    out.body = std::move(response);
    return out;
}

} // namespace pastebin
