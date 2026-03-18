/**
 * @file metrics_route_handler.cpp
 * @brief Prometheus-compatible /metrics endpoint implementation
 */

#include "metrics_route_handler.hpp"
#include <spdlog/spdlog.h>
#include <sstream>

namespace dbal {
namespace daemon {
namespace handlers {

// Static member definitions
std::atomic<uint64_t> MetricsRouteHandler::total_requests_{0};
std::atomic<uint64_t> MetricsRouteHandler::total_errors_{0};
std::atomic<int64_t> MetricsRouteHandler::active_connections_{0};
std::atomic<uint64_t> MetricsRouteHandler::requests_get_{0};
std::atomic<uint64_t> MetricsRouteHandler::requests_post_{0};
std::atomic<uint64_t> MetricsRouteHandler::requests_put_{0};
std::atomic<uint64_t> MetricsRouteHandler::requests_delete_{0};
std::atomic<uint64_t> MetricsRouteHandler::status_2xx_{0};
std::atomic<uint64_t> MetricsRouteHandler::status_4xx_{0};
std::atomic<uint64_t> MetricsRouteHandler::status_5xx_{0};

MetricsRouteHandler::MetricsRouteHandler(const std::string& server_address)
    : server_address_(server_address)
    , start_time_(std::chrono::steady_clock::now()) {}

void MetricsRouteHandler::recordRequest(const std::string& method, const std::string& path, int status_code, double duration_seconds) {
    total_requests_.fetch_add(1, std::memory_order_relaxed);

    if (method == "GET") requests_get_.fetch_add(1, std::memory_order_relaxed);
    else if (method == "POST") requests_post_.fetch_add(1, std::memory_order_relaxed);
    else if (method == "PUT") requests_put_.fetch_add(1, std::memory_order_relaxed);
    else if (method == "DELETE") requests_delete_.fetch_add(1, std::memory_order_relaxed);

    if (status_code >= 200 && status_code < 300) status_2xx_.fetch_add(1, std::memory_order_relaxed);
    else if (status_code >= 400 && status_code < 500) status_4xx_.fetch_add(1, std::memory_order_relaxed);
    else if (status_code >= 500) {
        status_5xx_.fetch_add(1, std::memory_order_relaxed);
        total_errors_.fetch_add(1, std::memory_order_relaxed);
    }
}

void MetricsRouteHandler::recordActiveConnection(int delta) {
    active_connections_.fetch_add(delta, std::memory_order_relaxed);
}

void MetricsRouteHandler::handleMetrics(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) const {
    auto now = std::chrono::steady_clock::now();
    double uptime_seconds = std::chrono::duration<double>(now - start_time_).count();

    std::ostringstream out;
    out << "# HELP dbal_uptime_seconds Time since DBAL daemon started\n"
        << "# TYPE dbal_uptime_seconds gauge\n"
        << "dbal_uptime_seconds " << uptime_seconds << "\n\n"

        << "# HELP dbal_requests_total Total number of HTTP requests\n"
        << "# TYPE dbal_requests_total counter\n"
        << "dbal_requests_total " << total_requests_.load(std::memory_order_relaxed) << "\n\n"

        << "# HELP dbal_errors_total Total number of 5xx errors\n"
        << "# TYPE dbal_errors_total counter\n"
        << "dbal_errors_total " << total_errors_.load(std::memory_order_relaxed) << "\n\n"

        << "# HELP dbal_active_connections Current active connections\n"
        << "# TYPE dbal_active_connections gauge\n"
        << "dbal_active_connections " << active_connections_.load(std::memory_order_relaxed) << "\n\n"

        << "# HELP dbal_requests_by_method_total Requests by HTTP method\n"
        << "# TYPE dbal_requests_by_method_total counter\n"
        << "dbal_requests_by_method_total{method=\"GET\"} " << requests_get_.load(std::memory_order_relaxed) << "\n"
        << "dbal_requests_by_method_total{method=\"POST\"} " << requests_post_.load(std::memory_order_relaxed) << "\n"
        << "dbal_requests_by_method_total{method=\"PUT\"} " << requests_put_.load(std::memory_order_relaxed) << "\n"
        << "dbal_requests_by_method_total{method=\"DELETE\"} " << requests_delete_.load(std::memory_order_relaxed) << "\n\n"

        << "# HELP dbal_responses_by_status_total Responses by status code class\n"
        << "# TYPE dbal_responses_by_status_total counter\n"
        << "dbal_responses_by_status_total{status=\"2xx\"} " << status_2xx_.load(std::memory_order_relaxed) << "\n"
        << "dbal_responses_by_status_total{status=\"4xx\"} " << status_4xx_.load(std::memory_order_relaxed) << "\n"
        << "dbal_responses_by_status_total{status=\"5xx\"} " << status_5xx_.load(std::memory_order_relaxed) << "\n\n"

        << "# HELP dbal_info DBAL daemon information\n"
        << "# TYPE dbal_info gauge\n"
        << "dbal_info{version=\"1.2.1\",address=\"" << server_address_ << "\"} 1\n";

    auto response = drogon::HttpResponse::newHttpResponse();
    response->setBody(out.str());
    response->setContentTypeCode(drogon::CT_TEXT_PLAIN);
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    response->addHeader("Access-Control-Allow-Origin", "*");
    callback(response);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
