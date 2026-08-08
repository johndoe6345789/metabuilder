#include "JwtJwks_fetch.hpp"
#include "CurlHandle.hpp"
#include "../util_env.hpp"

#include <mutex>

namespace email_backend {

namespace {

std::mutex g_mutex;
std::optional<std::string> g_cached;

std::string jwksUrl() {
    const std::string explicitUrl = envOr("DBAL_OIDC_JWKS_URL", "");
    if (!explicitUrl.empty())
        return explicitUrl;
    std::string base = envOr("DBAL_BASE_URL", "");
    if (!base.empty() && base.back() == '/')
        base.pop_back();
    return base.empty() ? "" : base + "/oidc/jwks.json";
}

std::optional<std::string> fetchFresh() {
    const std::string url = jwksUrl();
    if (url.empty())
        return std::nullopt;

    CurlHandle h;
    std::string response;
    curl_easy_setopt(h.curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(h.curl, CURLOPT_WRITEFUNCTION, writeToString);
    curl_easy_setopt(h.curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(h.curl, CURLOPT_TIMEOUT, 10L);

    if (curl_easy_perform(h.curl) != CURLE_OK)
        return std::nullopt;
    long status = 0;
    curl_easy_getinfo(h.curl, CURLINFO_RESPONSE_CODE, &status);
    if (status != 200)
        return std::nullopt;
    return response;
}

} // namespace

std::optional<std::string> fetchJwks(bool forceRefresh) {
    std::lock_guard<std::mutex> lock(g_mutex);
    if (forceRefresh || !g_cached)
        g_cached = fetchFresh();
    return g_cached;
}

} // namespace email_backend
