#include "supabase_auth_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace supabase {

SupabaseAuthManager::SupabaseAuthManager(std::string url, std::string api_key)
    : url_(std::move(url)),
      api_key_(std::move(api_key)),
      auth_token_(api_key_) {  // Default: use API key as token
    spdlog::debug("SupabaseAuthManager initialized for URL: {}", url_);
}

const std::string& SupabaseAuthManager::getAuthToken() const {
    return auth_token_;
}

bool SupabaseAuthManager::isAuthenticated() const {
    return authenticated_;
}

void SupabaseAuthManager::setAuthToken(const std::string& token) {
    auth_token_ = token;
    authenticated_ = !token.empty();
    spdlog::debug("Auth token updated, authenticated: {}", authenticated_);
}

void SupabaseAuthManager::clearAuth() {
    auth_token_ = api_key_;  // Revert to API key
    authenticated_ = true;    // Still authenticated with API key
    spdlog::debug("Auth cleared, reverted to API key");
}

} // namespace supabase
} // namespace adapters
} // namespace dbal
