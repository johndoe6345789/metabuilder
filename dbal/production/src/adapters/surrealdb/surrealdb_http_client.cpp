#include "surrealdb_http_client.hpp"
#include <cpr/cpr.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

SurrealDBHttpClient::SurrealDBHttpClient(std::string base_url, std::string ns, std::string db)
    : base_url_(std::move(base_url)),
      namespace_(std::move(ns)),
      database_(std::move(db)) {
}

void SurrealDBHttpClient::setAuthToken(const std::string& token) {
    auth_token_ = token;
}

Result<Json> SurrealDBHttpClient::post(const std::string& endpoint, const Json& body) {
    const std::string url = buildUrl(endpoint);
    
    try {
        auto response = cpr::Post(
            cpr::Url{url},
            cpr::Header{
                {"Accept", "application/json"},
                {"Content-Type", "application/json"},
                {"NS", namespace_},
                {"DB", database_},
                {"Authorization", buildAuthHeader()}
            },
            cpr::Body{body.dump()}
        );
        
        if (response.status_code != 200) {
            return Error(ErrorCode::InternalError,
                        "SurrealDB POST failed: " + response.text);
        }
        
        return Json::parse(response.text);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<Json> SurrealDBHttpClient::get(const std::string& resource_path) {
    const std::string url = buildUrl("/key/" + resource_path);
    
    try {
        auto response = cpr::Get(
            cpr::Url{url},
            cpr::Header{
                {"Accept", "application/json"},
                {"NS", namespace_},
                {"DB", database_},
                {"Authorization", buildAuthHeader()}
            }
        );
        
        if (response.status_code == 404) {
            return Error(ErrorCode::NotFound, "Resource not found");
        }
        
        if (response.status_code != 200) {
            return Error(ErrorCode::InternalError,
                        "SurrealDB GET failed: " + response.text);
        }
        
        return Json::parse(response.text);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<Json> SurrealDBHttpClient::patch(const std::string& resource_path, const Json& body) {
    const std::string url = buildUrl("/key/" + resource_path);
    
    try {
        auto response = cpr::Patch(
            cpr::Url{url},
            cpr::Header{
                {"Accept", "application/json"},
                {"Content-Type", "application/json"},
                {"NS", namespace_},
                {"DB", database_},
                {"Authorization", buildAuthHeader()}
            },
            cpr::Body{body.dump()}
        );
        
        if (response.status_code != 200) {
            return Error(ErrorCode::InternalError,
                        "SurrealDB PATCH failed: " + response.text);
        }
        
        return Json::parse(response.text);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<bool> SurrealDBHttpClient::deleteRequest(const std::string& resource_path) {
    const std::string url = buildUrl("/key/" + resource_path);
    
    try {
        auto response = cpr::Delete(
            cpr::Url{url},
            cpr::Header{
                {"Accept", "application/json"},
                {"NS", namespace_},
                {"DB", database_},
                {"Authorization", buildAuthHeader()}
            }
        );
        
        if (response.status_code != 200) {
            return Error(ErrorCode::InternalError,
                        "SurrealDB DELETE failed: " + response.text);
        }
        
        return true;
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

Result<Json> SurrealDBHttpClient::executeSql(const std::string& query) {
    const std::string url = buildUrl("/sql");
    
    try {
        auto response = cpr::Post(
            cpr::Url{url},
            cpr::Header{
                {"Accept", "application/json"},
                {"Content-Type", "text/plain"},
                {"NS", namespace_},
                {"DB", database_},
                {"Authorization", buildAuthHeader()}
            },
            cpr::Body{query}
        );
        
        if (response.status_code != 200) {
            return Error(ErrorCode::InternalError,
                        "SurrealDB SQL query failed: " + response.text);
        }
        
        return Json::parse(response.text);
    } catch (const std::exception& e) {
        return Error(ErrorCode::InternalError, e.what());
    }
}

std::string SurrealDBHttpClient::buildUrl(const std::string& path) const {
    return base_url_ + path;
}

std::string SurrealDBHttpClient::buildAuthHeader() const {
    return "Bearer " + auth_token_;
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
