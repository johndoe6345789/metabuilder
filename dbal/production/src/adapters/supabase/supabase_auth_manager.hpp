#ifndef DBAL_SUPABASE_AUTH_MANAGER_HPP
#define DBAL_SUPABASE_AUTH_MANAGER_HPP

#include <string>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

/**
 * Authentication Manager - Handles Supabase JWT token management
 *
 * Supabase uses JWT (JSON Web Tokens) for authentication:
 * - API keys (anon/service_role) act as both credentials and tokens
 * - Future: May support user signin via /auth/v1/token endpoint
 * - Manages token lifecycle and validation
 *
 * Current implementation uses API key as auth token (stateless).
 * Future: Can integrate with Supabase Auth for user sessions.
 */
class SupabaseAuthManager {
public:
    SupabaseAuthManager(std::string url, std::string api_key);

    /**
     * Get the current authentication token
     * For now, returns the API key (anon or service_role)
     */
    const std::string& getAuthToken() const;

    /**
     * Check if authenticated (always true with API key)
     */
    bool isAuthenticated() const;

    /**
     * Set a custom auth token (e.g., from user login)
     * Future: Used when integrating with /auth/v1/token endpoint
     */
    void setAuthToken(const std::string& token);

    /**
     * Clear authentication state (revert to API key)
     */
    void clearAuth();

    /**
     * Future: Sign in user via /auth/v1/token endpoint
     * POSTs email/password and returns JWT token
     *
     * @param email User email
     * @param password User password
     * @return Result with JWT token or error
     */
    // Result<bool> signinUser(const std::string& email, const std::string& password);

private:
    std::string url_;          // Supabase project URL
    std::string api_key_;      // API key (anon or service_role)
    std::string auth_token_;   // Current auth token (defaults to api_key_)
    bool authenticated_ = true; // Always true with API key
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_SUPABASE_AUTH_MANAGER_HPP
