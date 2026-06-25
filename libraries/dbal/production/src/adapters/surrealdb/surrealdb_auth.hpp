#ifndef DBAL_SURREALDB_AUTH_HPP
#define DBAL_SURREALDB_AUTH_HPP

#include <string>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace surrealdb {

/**
 * Authentication Manager - Handles SurrealDB signin and token management
 *
 * Authenticates via /signin endpoint using namespace, database, and credentials
 * Stores authentication token for subsequent requests
 */
class SurrealDBAuth {
public:
    SurrealDBAuth(std::string url, std::string ns, std::string db, 
                  std::string user, std::string pass);
    
    /**
     * Sign in to SurrealDB and obtain auth token
     * POSTs credentials to /signin endpoint
     */
    Result<bool> signin();
    
    /**
     * Get the current authentication token
     */
    const std::string& getAuthToken() const;
    
    /**
     * Check if authenticated
     */
    bool isAuthenticated() const;
    
    /**
     * Clear authentication state
     */
    void clearAuth();
    
private:
    std::string url_;
    std::string namespace_;
    std::string database_;
    std::string username_;
    std::string password_;
    std::string auth_token_;
    bool authenticated_ = false;
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif // DBAL_SURREALDB_AUTH_HPP
