/**
 * @file schema_route_handler.hpp
 * @brief Schema management endpoint handlers
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @class SchemaRouteHandler
 * @brief Handles schema management operations
 *
 * Supports:
 * - GET  /api/dbal/schema - List schemas and pending migrations
 * - POST /api/dbal/schema - Execute actions (scan, approve, reject, generate)
 *
 * Actions:
 * - scan: Scan packages for entity definitions
 * - approve: Approve pending migration
 * - reject: Reject pending migration
 * - generate: Generate Prisma schema from approved entities
 */
class SchemaRouteHandler {
public:
    SchemaRouteHandler(
        const std::string& registry_path,
        const std::string& packages_path,
        const std::string& output_path
    );

    /**
     * @brief Handle schema management requests
     * GET  -> List schemas/status
     * POST -> Execute actions
     */
    void handleSchema(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    );

private:
    std::string registry_path_;
    std::string packages_path_;
    std::string output_path_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
