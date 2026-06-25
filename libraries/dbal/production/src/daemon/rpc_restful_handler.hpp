#ifndef DBAL_RPC_RESTFUL_HANDLER_HPP
#define DBAL_RPC_RESTFUL_HANDLER_HPP

#include "response_formatter.hpp"
#include <functional>
#include <json/json.h>
#include <string>
#include <vector>

#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace rpc {

/**
 * @brief Parsed route information from RESTful path
 * 
 * Route pattern: /{tenant}/{package}/{entity}[/{id}[/{action}]]
 * 
 * Examples:
 *   GET  /acme_corp/forum_forge/posts           -> list posts
 *   GET  /acme_corp/forum_forge/posts/123       -> read post 123
 *   POST /acme_corp/forum_forge/posts           -> create post
 *   PUT  /acme_corp/forum_forge/posts/123       -> update post 123
 *   DELETE /acme_corp/forum_forge/posts/123     -> delete post 123
 *   POST /acme_corp/forum_forge/posts/123/like  -> custom action
 */
struct RouteInfo {
    std::string tenant;       // Tenant identifier (username or tenant name)
    std::string package;      // Package name (e.g., forum_forge)
    std::string entity;       // Entity name (e.g., posts, users)
    std::string id;           // Optional: Resource ID
    std::string action;       // Optional: Custom action (e.g., like, approve)
    std::vector<std::string> extra_args;  // Any additional path segments
    
    bool valid = false;
    std::string error;
    
    /**
     * @brief Get the prefixed entity name for DBAL
     * Format: Pkg_{PascalPackage}_{Entity}
     */
    std::string getPrefixedEntity() const;
    
    /**
     * @brief Get the table name
     * Format: {package}_{lowercase_entity}
     */
    std::string getTableName() const;
};

/**
 * @brief Parse a RESTful path into route components
 * @param path The request path (e.g., "/acme_corp/forum_forge/posts/123")
 * @return Parsed RouteInfo
 */
RouteInfo parseRoute(const std::string& path);

/**
 * @brief Convert snake_case to PascalCase
 */
std::string toPascalCase(const std::string& snake_case);

/**
 * @brief Convert string to lowercase
 */
std::string toLower(const std::string& str);

/**
 * @brief Handle a RESTful DBAL request
 * 
 * @param route Parsed route information
 * @param method HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param body Request body (for POST/PUT/PATCH)
 * @param query Query parameters
 * @param send_success Success callback
 * @param send_error Error callback
 */
void handleRestfulRequest(
    Client& client,
    const RouteInfo& route,
    const std::string& method,
    const ::Json::Value& body,
    const std::map<std::string, std::string>& query,
    ResponseSender send_success,
    ErrorSender send_error
);

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_RPC_RESTFUL_HANDLER_HPP
