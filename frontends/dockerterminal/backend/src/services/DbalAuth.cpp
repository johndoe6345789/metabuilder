#include "DbalAuth.hpp"
#include "../util.hpp"

#include <curl/curl.h>
#include <json/json.h>

#include <set>
#include <sstream>

namespace dockerterminal {

namespace {

const std::set<std::string> kAdminRoles = {"admin", "god", "supergod"};

size_t writeToString(char* ptr, size_t size, size_t nmemb, void* userdata) {
    auto* out = static_cast<std::string*>(userdata);
    out->append(ptr, size * nmemb);
    return size * nmemb;
}

} // namespace

std::optional<std::string> verifyAdminCaller(const drogon::HttpRequestPtr& req) {
    auto authHeader = req->getHeader("Authorization");
    if (authHeader.rfind("Bearer ", 0) != 0)
        return std::nullopt;
    std::string token = authHeader.substr(7);

    std::string dbalUrl = envOr("DBAL_ENDPOINT", envOr("DBAL_URL", "http://localhost:8080"));

    CURL* curl = curl_easy_init();
    if (!curl)
        return std::nullopt;

    std::string url = dbalUrl + "/oidc/userinfo";
    std::string response;
    std::string authValue = "Authorization: Bearer " + token;
    struct curl_slist* headers = curl_slist_append(nullptr, authValue.c_str());

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);

    CURLcode res = curl_easy_perform(curl);
    long status = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);

    if (res != CURLE_OK || status != 200)
        return std::nullopt;

    Json::Value claims;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(response);
    if (!Json::parseFromStream(b, in, &claims, &errs))
        return std::nullopt;

    if (kAdminRoles.count(claims.get("role", "").asString()) == 0)
        return std::nullopt;

    return claims.get("sub", "").asString();
}

} // namespace dockerterminal
