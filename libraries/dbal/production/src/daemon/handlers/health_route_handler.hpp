/**
 * @file health_route_handler.hpp
 * @brief Health, version, and status endpoint handlers
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
 * @class HealthRouteHandler
 * @brief Handles health check, version, and status endpoints
 *
 * Provides simple monitoring endpoints for service health checking
 * and status reporting without requiring database access.
 */
class HealthRouteHandler {
public:
    explicit HealthRouteHandler(const std::string& server_address);

    /**
     * @brief Handle /health and /healthz endpoints
     * Returns basic health status in JSON format
     */
    void handleHealth(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

    /**
     * @brief Handle /version and /api/version endpoints
     * Returns service version information
     */
    void handleVersion(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

    /**
     * @brief Handle /status and /api/status endpoints
     * Returns current server status including bind address
     */
    void handleStatus(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

private:
    std::string server_address_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
