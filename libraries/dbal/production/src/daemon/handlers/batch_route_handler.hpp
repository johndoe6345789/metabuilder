/**
 * @file batch_route_handler.hpp
 * @brief Multi-entity batch operations endpoint handler
 *
 * Handles POST /{tenant}/{package}/_batch for executing multiple
 * heterogeneous CRUD operations across different entities within
 * a single transaction.
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>
#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @class BatchRouteHandler
 * @brief Handles transactional batch operations across multiple entities
 *
 * Accepts an array of operations (create/update/delete) targeting different
 * entity types within the same package. All operations execute within a
 * single transaction -- if any operation fails, the entire batch is rolled back.
 *
 * Request format:
 * POST /{tenant}/{package}/_batch
 * {
 *   "operations": [
 *     { "action": "create", "entity": "users", "data": { ... } },
 *     { "action": "update", "entity": "posts", "id": "abc", "data": { ... } },
 *     { "action": "delete", "entity": "comments", "id": "xyz" }
 *   ]
 * }
 */
class BatchRouteHandler {
public:
    explicit BatchRouteHandler(dbal::Client& client);

    /**
     * @brief Handle a batch request containing multiple CRUD operations
     * @param request The HTTP request with operations array
     * @param callback Drogon response callback
     * @param tenant Tenant identifier from route
     * @param package Package name from route
     */
    void handleBatch(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package
    );

private:
    dbal::Client& client_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
