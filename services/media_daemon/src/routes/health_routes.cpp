#include "routes/health_routes.hpp"
#include <json/json.h>
#include <sstream>
#include <chrono>

namespace media::routes {

void HealthRoutes::handle_health(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    Json::Value body;
    body["status"] = "ok";
    body["service"] = "media-daemon";
    body["version"] = "1.0.0";

    // Plugin health
    auto plugin_health = plugin_manager_.health_check();
    Json::Value plugins_json(Json::objectValue);
    bool all_plugins_ok = true;
    for (const auto& [id, healthy] : plugin_health) {
        plugins_json[id] = healthy;
        if (!healthy) all_plugins_ok = false;
    }
    body["plugins"] = plugins_json;

    // Queue stats
    auto stats = job_queue_.get_stats();
    Json::Value queue;
    queue["pending"] = static_cast<Json::UInt64>(stats.pending_jobs);
    queue["processing"] = static_cast<Json::UInt64>(stats.processing_jobs);
    queue["completed"] = static_cast<Json::UInt64>(stats.completed_jobs);
    queue["failed"] = static_cast<Json::UInt64>(stats.failed_jobs);
    queue["total_workers"] = stats.total_workers;
    queue["busy_workers"] = stats.busy_workers;
    body["queue"] = queue;

    // Radio
    Json::Value radio;
    int radio_live = 0;
    for (const auto& ch : radio_engine_.list_channels()) {
        if (ch.is_live) ++radio_live;
    }
    radio["live_channels"] = radio_live;
    radio["total_listeners"] = radio_engine_.get_total_listeners();
    body["radio"] = radio;

    // TV
    Json::Value tv;
    int tv_live = 0;
    for (const auto& ch : tv_engine_.list_channels()) {
        if (ch.is_live) ++tv_live;
    }
    tv["live_channels"] = tv_live;
    tv["total_viewers"] = tv_engine_.get_total_viewers();
    body["tv"] = tv;

    if (!all_plugins_ok) {
        body["status"] = "degraded";
    }

    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(drogon::k200OK);
    cb(resp);
}

void HealthRoutes::handle_metrics(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    // Prometheus text format
    auto stats = job_queue_.get_stats();

    std::ostringstream metrics;
    metrics << "# HELP media_jobs_pending Number of pending jobs\n";
    metrics << "# TYPE media_jobs_pending gauge\n";
    metrics << "media_jobs_pending " << stats.pending_jobs << "\n\n";

    metrics << "# HELP media_jobs_processing Number of jobs being processed\n";
    metrics << "# TYPE media_jobs_processing gauge\n";
    metrics << "media_jobs_processing " << stats.processing_jobs << "\n\n";

    metrics << "# HELP media_jobs_completed_total Total completed jobs\n";
    metrics << "# TYPE media_jobs_completed_total counter\n";
    metrics << "media_jobs_completed_total " << stats.completed_jobs << "\n\n";

    metrics << "# HELP media_jobs_failed_total Total failed jobs\n";
    metrics << "# TYPE media_jobs_failed_total counter\n";
    metrics << "media_jobs_failed_total " << stats.failed_jobs << "\n\n";

    metrics << "# HELP media_workers_total Total worker threads\n";
    metrics << "# TYPE media_workers_total gauge\n";
    metrics << "media_workers_total " << stats.total_workers << "\n\n";

    metrics << "# HELP media_workers_busy Busy worker threads\n";
    metrics << "# TYPE media_workers_busy gauge\n";
    metrics << "media_workers_busy " << stats.busy_workers << "\n\n";

    metrics << "# HELP media_radio_listeners_total Total radio listeners\n";
    metrics << "# TYPE media_radio_listeners_total gauge\n";
    metrics << "media_radio_listeners_total " << radio_engine_.get_total_listeners() << "\n\n";

    metrics << "# HELP media_tv_viewers_total Total TV viewers\n";
    metrics << "# TYPE media_tv_viewers_total gauge\n";
    metrics << "media_tv_viewers_total " << tv_engine_.get_total_viewers() << "\n\n";

    // Plugin health
    auto plugin_health = plugin_manager_.health_check();
    metrics << "# HELP media_plugin_healthy Plugin health status (1=healthy)\n";
    metrics << "# TYPE media_plugin_healthy gauge\n";
    for (const auto& [id, healthy] : plugin_health) {
        metrics << "media_plugin_healthy{plugin=\"" << id << "\"} " << (healthy ? 1 : 0) << "\n";
    }

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k200OK);
    resp->setContentTypeString("text/plain; version=0.0.4; charset=utf-8");
    resp->setBody(metrics.str());
    cb(resp);
}

} // namespace media::routes
