/**
 * @file metrics_route_handler.hpp
 * @brief Prometheus-compatible /metrics endpoint handler
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <atomic>
#include <chrono>
#include <string>

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @class MetricsRouteHandler
 * @brief Handles /metrics endpoint in Prometheus exposition format
 *
 * Provides runtime metrics including request counts, error rates,
 * active connections, and uptime for Prometheus scraping.
 */
class MetricsRouteHandler {
public:
    explicit MetricsRouteHandler(const std::string& server_address);

    /**
     * @brief Handle /metrics endpoint
     * Returns metrics in Prometheus text exposition format
     */
    void handleMetrics(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback
    ) const;

    // Call these from other handlers to track metrics
    static void recordRequest(const std::string& method, const std::string& path, int status_code, double duration_seconds);
    static void recordActiveConnection(int delta);

private:
    std::string server_address_;
    std::chrono::steady_clock::time_point start_time_;

    static std::atomic<uint64_t> total_requests_;
    static std::atomic<uint64_t> total_errors_;
    static std::atomic<int64_t> active_connections_;
    static std::atomic<uint64_t> requests_get_;
    static std::atomic<uint64_t> requests_post_;
    static std::atomic<uint64_t> requests_put_;
    static std::atomic<uint64_t> requests_delete_;
    static std::atomic<uint64_t> status_2xx_;
    static std::atomic<uint64_t> status_4xx_;
    static std::atomic<uint64_t> status_5xx_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
