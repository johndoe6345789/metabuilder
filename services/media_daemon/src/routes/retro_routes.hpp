#pragma once

#include "media/job_queue.hpp"
#include <drogon/drogon.h>
#include <functional>
#include <map>
#include <mutex>
#include <string>

namespace media::routes {

/**
 * HTTP routes for libretro gaming sessions.
 *
 * Sessions are submitted as RetroSession jobs and streamed via HLS.
 * Nginx proxies /hls/retro/<id>/index.m3u8 → ffmpeg RTMP ingest.
 */
class RetroRoutes {
public:
    RetroRoutes(JobQueue& jq, PluginManager& pm) : job_queue_(jq), plugin_manager_(pm) {}

    void handle_create_session(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_list_sessions(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_stop_session(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& session_id
    );

    void handle_send_input(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& session_id
    );

private:
    JobQueue& job_queue_;
    PluginManager& plugin_manager_;
    // Maps session_id → job_id for fast lookup
    std::map<std::string, std::string> session_to_job_;
    std::mutex sessions_mutex_;

    std::string hls_base_url() const;
    drogon::HttpResponsePtr json_ok(const Json::Value& body);
    drogon::HttpResponsePtr err(const std::string& msg, drogon::HttpStatusCode code);
};

} // namespace media::routes
