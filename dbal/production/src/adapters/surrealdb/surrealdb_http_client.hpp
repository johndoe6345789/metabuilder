#ifndef DBAL_SURREALDB_HTTP_CLIENT_HPP
#define DBAL_SURREALDB_HTTP_CLIENT_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace surrealdb {

using Json = nlohmann::json;

/**
 * HTTP Client - Wraps cpr library for SurrealDB REST API calls
 *
 * Handles all HTTP communication with SurrealDB
 * Builds consistent headers (NS, DB, Authorization)
 * Parses JSON responses and handles errors
 */
class SurrealDBHttpClient {
public:
    SurrealDBHttpClient(std::string base_url, std::string ns, std::string db);
    
    /**
     * Set authentication token for requests
     */
    void setAuthToken(const std::string& token);
    
    /**
     * Execute HTTP POST request
     */
    Result<Json> post(const std::string& endpoint, const Json& body);
    
    /**
     * Execute HTTP GET request
     */
    Result<Json> get(const std::string& resource_path);
    
    /**
     * Execute HTTP PATCH request (partial update)
     */
    Result<Json> patch(const std::string& resource_path, const Json& body);
    
    /**
     * Execute HTTP DELETE request
     */
    Result<bool> deleteRequest(const std::string& resource_path);
    
    /**
     * Execute SurrealQL query via /sql endpoint
     */
    Result<Json> executeSql(const std::string& query);
    
private:
    std::string buildUrl(const std::string& path) const;
    std::string buildAuthHeader() const;
    
    std::string base_url_;
    std::string namespace_;
    std::string database_;
    std::string auth_token_;
};

} // namespace surrealdb
} // namespace adapters
} // namespace dbal

#endif // DBAL_SURREALDB_HTTP_CLIENT_HPP
