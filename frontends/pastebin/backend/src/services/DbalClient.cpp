#include "DbalClient.hpp"
#include "CurlHandle.hpp"
#include "DbalClient_method.hpp"
#include "../util.hpp"

#include <iostream>

namespace pastebin {

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
    applyHttpMethod(h.curl, toUpperAscii(method), jsonBody, bodyText);

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
