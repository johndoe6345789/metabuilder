/**
 * @file rpc_route_handler.hpp
 * @brief RPC-style endpoint handler for legacy API
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <memory>
#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @class RpcRouteHandler
 * @brief Handles RPC-style requests to /api/dbal
 *
 * Legacy RPC format:
 * POST /api/dbal
 * {
 *   "entity": "user",
 *   "action": "create|read|update|delete|list",
 *   "payload": { ... },
 *   "tenantId": "..."
 * }
 */
class RpcRouteHandler {
public:
    explicit RpcRouteHandler(dbal::Client& client);

    /**
     * @brief Handle RPC-style requests
     * Parses JSON body and dispatches to appropriate entity handler
     */
    void handleRpc(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    );

private:
    dbal::Client& client_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
