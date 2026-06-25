#include "supabase_http_client.hpp"
#include <cpr/cpr.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace supabase {

SupabaseHttpClient::SupabaseHttpClient(std::string base_url, std::string api_key, int timeout)
    : base_url_(std::move(base_url)),
      api_key_(std::move(api_key)),
      auth_token_(api_key_),  // Default: use API key as auth token
      timeout_(timeout) {
    spdlog::debug("SupabaseHttpClient initialized with URL: {}", base_url_);
}

void SupabaseHttpClient::setAuthToken(const std::string& token) {
    auth_token_ = token;
    spdlog::debug("Auth token updated");
}

Result<Json> SupabaseHttpClient::post(const std::string& endpoint, const Json& body) {
    const auto url = buildUrl("/rest/v1/" + endpoint);
    spdlog::debug("POST {}", url);

    auto response = cpr::Post(
        cpr::Url{url},
        cpr::Header{
            {"Content-Type", "application/json"},
            {"apikey", api_key_},
            {"Authorization", "Bearer " + auth_token_},
            {"Prefer", "return=representation"}
        },
        cpr::Body{body.dump()},
        cpr::Timeout{timeout_}
    );

    return handleResponse(response.text, static_cast<int>(response.status_code));
}

Result<Json> SupabaseHttpClient::get(const std::string& resource_path) {
    const auto url = buildUrl("/rest/v1/" + resource_path);
    spdlog::debug("GET {}", url);

    auto response = cpr::Get(
        cpr::Url{url},
        cpr::Header{
            {"Content-Type", "application/json"},
            {"apikey", api_key_},
            {"Authorization", "Bearer " + auth_token_}
        },
        cpr::Timeout{timeout_}
    );

    return handleResponse(response.text, static_cast<int>(response.status_code));
}

Result<HttpListResponse> SupabaseHttpClient::getList(const std::string& resource_path) {
    const auto url = buildUrl("/rest/v1/" + resource_path);
    spdlog::debug("GET (count) {}", url);

    auto response = cpr::Get(
        cpr::Url{url},
        cpr::Header{
            {"Content-Type", "application/json"},
            {"apikey", api_key_},
            {"Authorization", "Bearer " + auth_token_},
            {"Prefer", "count=exact"}
        },
        cpr::Timeout{timeout_}
    );

    auto itemsResult = handleResponse(response.text, static_cast<int>(response.status_code));
    if (itemsResult.isError()) {
        return Error(itemsResult.error().code(), itemsResult.error().what());
    }

    HttpListResponse listResp;
    listResp.items = itemsResult.value();

    // PostgREST returns "Content-Range: 0-49/200" or "*/200" when count=exact.
    auto it = response.header.find("Content-Range");
    if (it != response.header.end()) {
        const auto& cr = it->second;
        auto slashPos = cr.rfind('/');
        if (slashPos != std::string::npos) {
            try {
                listResp.total = std::stoi(cr.substr(slashPos + 1));
            } catch (...) {
                // Malformed header — leave total == -1
            }
        }
    }

    return listResp;
}

Result<Json> SupabaseHttpClient::patch(const std::string& resource_path, const Json& body) {
    const auto url = buildUrl("/rest/v1/" + resource_path);
    spdlog::debug("PATCH {}", url);

    auto response = cpr::Patch(
        cpr::Url{url},
        cpr::Header{
            {"Content-Type", "application/json"},
            {"apikey", api_key_},
            {"Authorization", "Bearer " + auth_token_},
            {"Prefer", "return=representation"}
        },
        cpr::Body{body.dump()},
        cpr::Timeout{timeout_}
    );

    return handleResponse(response.text, static_cast<int>(response.status_code));
}

Result<bool> SupabaseHttpClient::deleteRequest(const std::string& resource_path) {
    const auto url = buildUrl("/rest/v1/" + resource_path);
    spdlog::debug("DELETE {}", url);

    auto response = cpr::Delete(
        cpr::Url{url},
        cpr::Header{
            {"Content-Type", "application/json"},
            {"apikey", api_key_},
            {"Authorization", "Bearer " + auth_token_}
        },
        cpr::Timeout{timeout_}
    );

    if (response.status_code >= 200 && response.status_code < 300) {
        return Result<bool>(true);
    }

    return Error::internal("Delete failed: " + response.text);
}

std::string SupabaseHttpClient::buildUrl(const std::string& path) const {
    return base_url_ + path;
}

std::string SupabaseHttpClient::buildAuthHeader() const {
    return "Bearer " + auth_token_;
}

Result<Json> SupabaseHttpClient::handleResponse(const std::string& text, int status_code) const {
    if (status_code >= 200 && status_code < 300) {
        try {
            if (text.empty()) {
                return Result<Json>(Json::array());
            }
            return Result<Json>(Json::parse(text));
        } catch (const std::exception& e) {
            return Error::internal("Failed to parse response: " + std::string(e.what()));
        }
    }

    // Handle HTTP error codes
    if (status_code == 404) {
        return Error::notFound(text);
    }
    if (status_code == 409) {
        return Error::conflict(text);
    }
    if (status_code == 400 || status_code == 422) {
        return Error::validationError(text);
    }
    if (status_code == 401) {
        return Error::unauthorized(text);
    }
    if (status_code == 403) {
        return Error::forbidden(text);
    }

    return Error::internal("HTTP " + std::to_string(status_code) + ": " + text);
}

} // namespace supabase
} // namespace adapters
} // namespace dbal
