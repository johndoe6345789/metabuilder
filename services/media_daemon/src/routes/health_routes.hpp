#pragma once
#include "media/plugin_manager.hpp"
#include "media/job_queue.hpp"
#include "media/radio_engine.hpp"
#include "media/tv_engine.hpp"
#include <drogon/drogon.h>
#include <functional>

namespace media::routes {

class HealthRoutes {
public:
    HealthRoutes(
        PluginManager& pm,
        JobQueue& jq,
        RadioEngine& re,
        TvEngine& te
    ) : plugin_manager_(pm), job_queue_(jq), radio_engine_(re), tv_engine_(te) {}

    void handle_health(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_metrics(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

private:
    PluginManager& plugin_manager_;
    JobQueue& job_queue_;
    RadioEngine& radio_engine_;
    TvEngine& tv_engine_;
};

} // namespace media::routes
