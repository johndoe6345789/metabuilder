#include "DbalAuth.hpp"
#include "CurlHandle.hpp"
#include "../util.hpp"

#include <json/json.h>

#include <set>
#include <sstream>

namespace dockerterminal {

namespace {

const std::set<std::string> kAdminRoles = {"admin", "god", "supergod"};

std::optional<std::string> fetchUserinfo(const std::string& token) {
    const std::string dbalUrl =
        envOr("DBAL_ENDPOINT", envOr("DBAL_URL", "http://localhost:8080"));
    const std::string url = dbalUrl + "/oidc/userinfo";
    const std::string authValue = "Authorization: Bearer " + token;

    CurlHandle h;
    std::string response;
    struct curl_slist* headers = curl_slist_append(nullptr, authValue.c_str());

    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 5L);

    const CURLcode res = curl_easy_perform(h.curl);
    long status = 0;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &status);
    curl_slist_free_all(headers);

    if (res != CURLE_OK || status != 200)
        return std::nullopt;
    return response;
}

} // namespace

std::optional<std::string> verifyAdminCaller(
    const drogon::HttpRequestPtr& req) {
    const auto authHeader = req->getHeader("Authorization");
    if (authHeader.rfind("Bearer ", 0) != 0)
        return std::nullopt;

    const auto body = fetchUserinfo(authHeader.substr(7));
    if (!body)
        return std::nullopt;

    Json::Value claims;
    Json::CharReaderBuilder b;
    std::string errs;
    std::istringstream in(*body);
    if (!Json::parseFromStream(b, in, &claims, &errs))
        return std::nullopt;

    if (kAdminRoles.count(claims.get("role", "").asString()) == 0)
        return std::nullopt;
    return claims.get("sub", "").asString();
}

} // namespace dockerterminal
