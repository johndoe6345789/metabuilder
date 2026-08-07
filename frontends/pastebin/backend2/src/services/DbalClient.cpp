#include "DbalClient.hpp"
#include "CurlHandle.hpp"
#include "../util.hpp"

#include <cctype>
#include <iostream>

namespace pastebin {

namespace {

std::string toUpper(std::string s) {
    for (auto& c : s)
        c = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
    return s;
}

void applyMethod(CURL* curl, const std::string& upperMethod,
                  const nlohmann::json* jsonBody,
                  const std::string& bodyText) {
    if (jsonBody) {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, bodyText.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE,
                          static_cast<long>(bodyText.size()));
    }
    if (upperMethod == "GET") {
        curl_easy_setopt(curl, CURLOPT_HTTPGET, 1L);
    } else if (upperMethod == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        if (!jsonBody)
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, 0L);
    } else {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, upperMethod.c_str());
        if (jsonBody)
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
    }
}

} // namespace

std::optional<DbalResponse> dbalRequest(const std::string& method,
                                         const std::string& path,
                                         const nlohmann::json* jsonBody) {
    std::string base = envOr("DBAL_BASE_URL", "");
    if (base.empty())
        return std::nullopt;
    if (base.back() == '/')
        base.pop_back();

    CurlHandle h;
    const std::string url = base + path;
    std::string response;

    CurlSlist headers;
    headers.append("Content-Type: application/json");
    const std::string adminToken = envOr("DBAL_ADMIN_TOKEN", "");
    if (!adminToken.empty())
        headers.append("Authorization: Bearer " + adminToken);

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers.list);
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 10L);

    const std::string bodyText = jsonBody ? jsonBody->dump() : std::string();
    applyMethod(h.curl, toUpper(method), jsonBody, bodyText);

    const CURLcode res = curl_easy_perform(h.curl);
    if (res != CURLE_OK) {
        std::cerr << "[dbal] " << method << " " << path << " -- "
                  << curl_easy_strerror(res) << std::endl;
        return std::nullopt;
    }

    DbalResponse out;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &out.status);
    if (!response.empty()) {
        try {
            out.body = nlohmann::json::parse(response);
        } catch (const std::exception&) {
            out.body = nlohmann::json::object();
        }
    }
    return out;
}

} // namespace pastebin
