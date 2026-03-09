#pragma once
#include "media/radio_engine.hpp"
#include "media/stream_broadcaster.hpp"
#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace media::routes {

class RadioRoutes {
public:
    explicit RadioRoutes(RadioEngine& re) : radio_engine_(re), broadcaster_(nullptr) {}

    void set_broadcaster(StreamBroadcaster* b) { broadcaster_ = b; }

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

    void handle_set_playlist(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    void handle_now_playing(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& channel_id
    );

    /**
     * GET /stream/:mount
     * Opens a persistent HTTP audio stream for the given channel.
     * Listeners receive MP3 chunks pushed by the stream_thread via
     * StreamBroadcaster.
     */
    void handle_stream(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& mount
    );

private:
    RadioEngine& radio_engine_;
    StreamBroadcaster* broadcaster_;

    drogon::HttpResponsePtr json_response(const Json::Value& body, drogon::HttpStatusCode code);
    drogon::HttpResponsePtr error_response(const std::string& message, drogon::HttpStatusCode code);
    Json::Value status_to_json(const RadioChannelStatus& s);
};

} // namespace media::routes
