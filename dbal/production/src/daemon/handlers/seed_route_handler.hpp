/**
 * @file seed_route_handler.hpp
 * @brief Admin endpoint for loading seed data into the database
 *
 * POST /admin/seed — loads YAML seed files via the SeedLoaderAction.
 * Requires DBAL_ADMIN_TOKEN authentication.
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

class SeedRouteHandler {
public:
    explicit SeedRouteHandler(Client& client);

    /**
     * POST /admin/seed
     *
     * Request body (optional JSON):
     *   {
     *     "force": false,       // Skip skipIfExists checks
     *     "seed_dir": "path"    // Override default seed directory
     *   }
     *
     * Response:
     *   {
     *     "success": true,
     *     "data": {
     *       "total_inserted": 42,
     *       "total_skipped": 3,
     *       "total_failed": 0,
     *       "seed_dir": "/app/dbal/shared/seeds/database",
     *       "results": [
     *         { "entity": "User", "inserted": 3, "skipped": 0, "failed": 0, "errors": [] },
     *         ...
     *       ]
     *     }
     *   }
     */
    void handleSeed(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    );

private:
    bool validateAdminAuth(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>& callback) const;
    void applyCorsHeaders(const drogon::HttpRequestPtr& request,
                          const drogon::HttpResponsePtr& response) const;

    Client& client_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
