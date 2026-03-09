#pragma once
#include "media/tv_engine.hpp"
#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace media::routes {

class TvRoutes {
public:
    explicit TvRoutes(TvEngine& te) : tv_engine_(te) {}

    void handle_create_channel(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_list_channels(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_get_channel(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    void handle_start_channel(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    void handle_stop_channel(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    void handle_get_schedule(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    void handle_get_epg(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

private:
    TvEngine& tv_engine_;

    drogon::HttpResponsePtr json_response(const Json::Value& body, drogon::HttpStatusCode code);
    drogon::HttpResponsePtr error_response(const std::string& message, drogon::HttpStatusCode code);
    drogon::HttpResponsePtr text_response(const std::string& body, const std::string& content_type);
    Json::Value status_to_json(const TvChannelStatus& s);
    Json::Value program_to_json(const TvProgram& p);
    Json::Value schedule_to_json(const TvScheduleEntry& e);
};

} // namespace media::routes
