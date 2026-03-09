#include "routes/plugin_routes.hpp"
#include <json/json.h>
#include <iostream>

namespace media::routes {

// ============================================================================
// Helpers
// ============================================================================

drogon::HttpResponsePtr PluginRoutes::json_response(
    const Json::Value& body,
    drogon::HttpStatusCode code
) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

drogon::HttpResponsePtr PluginRoutes::error_response(
    const std::string& message,
    drogon::HttpStatusCode code
) {
    Json::Value body;
    body["error"] = message;
    return json_response(body, code);
}

Json::Value PluginRoutes::plugin_info_to_json(const PluginInfo& info) {
    Json::Value j;
    j["id"] = info.id;
    j["name"] = info.name;
    j["version"] = info.version;
    j["author"] = info.author;
    j["description"] = info.description;
    j["is_loaded"] = info.is_loaded;
    j["is_builtin"] = info.is_builtin;

    // Plugin type
    switch (info.type) {
        case PluginType::TRANSCODER: j["type"] = "transcoder"; break;
        case PluginType::PROCESSOR:  j["type"] = "processor"; break;
        case PluginType::STREAMER:   j["type"] = "streamer"; break;
        case PluginType::ANALYZER:   j["type"] = "analyzer"; break;
        default:                     j["type"] = "custom"; break;
    }

    // Supported formats
    Json::Value formats(Json::arrayValue);
    for (const auto& fmt : info.supported_formats) {
        formats.append(fmt);
    }
    j["supported_formats"] = formats;

    // Capabilities
    Json::Value caps(Json::arrayValue);
    for (const auto& cap : info.capabilities) {
        caps.append(cap);
    }
    j["capabilities"] = caps;

    return j;
}

// ============================================================================
// Route Handlers
// ============================================================================

void PluginRoutes::handle_list_plugins(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    auto plugins = plugin_manager_.list_plugins();

    Json::Value arr(Json::arrayValue);
    for (const auto& info : plugins) {
        arr.append(plugin_info_to_json(info));
    }

    // Plugin health check
    auto health = plugin_manager_.health_check();
    for (auto& plugin_json : arr) {
        const std::string id = plugin_json["id"].asString();
        auto it = health.find(id);
        if (it != health.end()) {
            plugin_json["healthy"] = it->second;
        }
    }

    Json::Value body;
    body["plugins"] = arr;
    body["count"] = static_cast<Json::UInt>(plugins.size());
    cb(json_response(body, drogon::k200OK));
}

void PluginRoutes::handle_reload_plugin(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& plugin_id
) {
    auto result = plugin_manager_.reload_plugin(plugin_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Plugin not found: " + plugin_id, drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value body;
    body["message"] = "Plugin reloaded";
    body["plugin"] = plugin_info_to_json(result.value());
    cb(json_response(body, drogon::k200OK));
}

} // namespace media::routes
