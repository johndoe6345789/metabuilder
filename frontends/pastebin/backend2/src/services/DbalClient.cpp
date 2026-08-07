#include "DbalClient.hpp"
#include "../util.hpp"

#include <curl/curl.h>

#include <cstring>
#include <iostream>

namespace pastebin {

namespace {

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

} // namespace

std::optional<DbalResponse> dbalRequest(const std::string& method, const std::string& path,
                                         const nlohmann::json* jsonBody) {
    std::string base = envOr("DBAL_BASE_URL", "");
    if (base.empty())
        return std::nullopt;
    // rstrip a single trailing slash, matching the Python DBAL_BASE_URL.rstrip('/')
    if (!base.empty() && base.back() == '/')
        base.pop_back();

    CURL* curl = curl_easy_init();
    if (!curl)
        return std::nullopt;

    std::string url = base + path;
    std::string response;
    std::string bodyText;
    struct curl_slist* headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    std::string adminToken = envOr("DBAL_ADMIN_TOKEN", "");
    std::string authHeader;
    if (!adminToken.empty()) {
        authHeader = "Authorization: Bearer " + adminToken;
        headers = curl_slist_append(headers, authHeader.c_str());
    }

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    std::string upperMethod = method;
    for (auto& c : upperMethod)
        c = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));

    if (jsonBody) {
        bodyText = jsonBody->dump();
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, bodyText.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(bodyText.size()));
    }
    if (upperMethod == "GET") {
        curl_easy_setopt(curl, CURLOPT_HTTPGET, 1L);
    } else if (upperMethod == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        if (!jsonBody)
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, 0L);
    } else {
        // PUT / PATCH / DELETE
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, upperMethod.c_str());
        if (jsonBody)
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
    }

    CURLcode res = curl_easy_perform(curl);
    curl_slist_free_all(headers);

    if (res != CURLE_OK) {
        std::cerr << "[dbal] " << method << " " << path << " -- " << curl_easy_strerror(res)
                  << std::endl;
        curl_easy_cleanup(curl);
        return std::nullopt;
    }

    DbalResponse out;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &out.status);
    curl_easy_cleanup(curl);

    if (!response.empty()) {
        try {
            out.body = nlohmann::json::parse(response);
        } catch (const std::exception&) {
            out.body = nlohmann::json::object();
        }
    }
    return out;
}

std::vector<nlohmann::json> dbalAllPages(const std::string& pathWithParams, int limit) {
    std::vector<nlohmann::json> results;
    int page = 1;
    char sep = pathWithParams.find('?') != std::string::npos ? '&' : '?';

    while (true) {
        std::string path = pathWithParams + sep + "limit=" + std::to_string(limit) +
                            "&page=" + std::to_string(page);
        auto r = dbalRequest("GET", path);
        if (!r || !r->ok())
            break;

        auto payload = r->body.value("data", nlohmann::json::object());
        auto batch = payload.value("data", nlohmann::json::array());
        for (auto& item : batch)
            results.push_back(item);

        int total = payload.value("total", 0);
        if (static_cast<int>(results.size()) >= total)
            break;
        page++;
    }
    return results;
}

} // namespace pastebin
