#pragma once
#include "media/plugin_manager.hpp"
#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace media::routes {

class PluginRoutes {
public:
    explicit PluginRoutes(PluginManager& pm) : plugin_manager_(pm) {}

    void handle_list_plugins(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_reload_plugin(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& plugin_id
    );

private:
    PluginManager& plugin_manager_;

    drogon::HttpResponsePtr json_response(const Json::Value& body, drogon::HttpStatusCode code);
    drogon::HttpResponsePtr error_response(const std::string& message, drogon::HttpStatusCode code);
    Json::Value plugin_info_to_json(const PluginInfo& info);
};

} // namespace media::routes
