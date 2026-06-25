#include "surrealdb_auth.hpp"
#include <cpr/cpr.h>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

using Json = nlohmann::json;

SurrealDBAuth::SurrealDBAuth(std::string url, std::string ns, std::string db, 
                             std::string user, std::string pass)
    : url_(std::move(url)),
      namespace_(std::move(ns)),
      database_(std::move(db)),
      username_(std::move(user)),
      password_(std::move(pass)),
      authenticated_(false) {
}

Result<bool> SurrealDBAuth::signin() {
    // Build authentication request body
    Json auth_body = {
        {"NS", namespace_},
        {"DB", database_},
        {"SC", "root"},
        {"user", username_},
        {"pass", password_}
    };
    
    const std::string signin_url = url_ + "/signin";
    
    try {
        spdlog::debug("SurrealDBAuth: Attempting signin to {}", signin_url);
        
        auto response = cpr::Post(
            cpr::Url{signin_url},
            cpr::Header{{"Content-Type", "application/json"}},
            cpr::Body{auth_body.dump()}
        );
        
        if (response.status_code != 200) {
            spdlog::error("SurrealDBAuth: Signin failed with status {}: {}", 
                         response.status_code, response.text);
            authenticated_ = false;
            return Error(ErrorCode::Unauthorized,
                        "SurrealDB authentication failed: " + response.text);
        }
        
        // Parse response and extract token
        const Json response_json = Json::parse(response.text);
        if (response_json.contains("token")) {
            auth_token_ = response_json["token"].get<std::string>();
            authenticated_ = true;
            spdlog::info("SurrealDBAuth: Successfully authenticated");
            return true;
        }
        
        spdlog::warn("SurrealDBAuth: Response missing token field");
        authenticated_ = false;
        return Error(ErrorCode::Unauthorized, "Authentication response missing token");
        
    } catch (const std::exception& e) {
        spdlog::error("SurrealDBAuth: Signin exception: {}", e.what());
        authenticated_ = false;
        return Error(ErrorCode::DatabaseError, e.what());
    }
}

const std::string& SurrealDBAuth::getAuthToken() const {
    return auth_token_;
}

bool SurrealDBAuth::isAuthenticated() const {
    return authenticated_;
}

void SurrealDBAuth::clearAuth() {
    auth_token_.clear();
    authenticated_ = false;
    spdlog::debug("SurrealDBAuth: Cleared authentication");
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
