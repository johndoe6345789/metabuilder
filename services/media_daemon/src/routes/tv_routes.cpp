#include "routes/tv_routes.hpp"
#include <json/json.h>
#include <chrono>
#include <ctime>
#include <iostream>
#include <sstream>

namespace media::routes {

// ============================================================================
// Helpers
// ============================================================================

drogon::HttpResponsePtr TvRoutes::json_response(
    const Json::Value& body,
    drogon::HttpStatusCode code
) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

drogon::HttpResponsePtr TvRoutes::error_response(
    const std::string& message,
    drogon::HttpStatusCode code
) {
    Json::Value body;
    body["error"] = message;
    return json_response(body, code);
}

drogon::HttpResponsePtr TvRoutes::text_response(
    const std::string& body,
    const std::string& content_type
) {
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k200OK);
    resp->setContentTypeString(content_type);
    resp->setBody(body);
    return resp;
}

Json::Value TvRoutes::status_to_json(const TvChannelStatus& s) {
    Json::Value j;
    j["id"] = s.id;
    j["name"] = s.name;
    j["channel_number"] = s.channel_number;
    j["is_live"] = s.is_live;
    j["viewers"] = s.viewers;
    j["hls_url"] = s.hls_url;
    j["dash_url"] = s.dash_url;

    if (s.now_playing.has_value()) {
        j["now_playing"] = program_to_json(s.now_playing.value());
    }

    if (s.next_program.has_value()) {
        j["next_program"] = program_to_json(s.next_program.value());
    }

    return j;
}

Json::Value TvRoutes::program_to_json(const TvProgram& p) {
    Json::Value j;
    j["id"] = p.id;
    j["title"] = p.title;
    j["description"] = p.description;
    j["category"] = p.category;
    j["duration_seconds"] = p.duration_seconds;
    j["thumbnail_url"] = p.thumbnail_url;
    j["rating"] = p.rating;
    j["content_path"] = p.content_path;
    return j;
}

Json::Value TvRoutes::schedule_to_json(const TvScheduleEntry& e) {
    Json::Value j;
    j["program"] = program_to_json(e.program);
    j["is_live"] = e.is_live;

    auto tp_to_str = [](std::chrono::system_clock::time_point tp) -> std::string {
        std::time_t t = std::chrono::system_clock::to_time_t(tp);
        std::tm* tm = std::gmtime(&t);
        char buf[32];
        std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", tm);
        return std::string(buf);
    };

    j["start_time"] = tp_to_str(e.start_time);
    j["end_time"] = tp_to_str(e.end_time);

    return j;
}

// ============================================================================
// Route Handlers
// ============================================================================

void TvRoutes::handle_create_channel(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    auto json = req->getJsonObject();
    if (!json) {
        cb(error_response("Invalid JSON body", drogon::k400BadRequest));
        return;
    }

    TvChannelConfig config;
    config.id = (*json)["id"].asString();
    config.tenant_id = (*json)["tenant_id"].asString();
    config.name = (*json)["name"].asString();
    config.description = (*json).get("description", "").asString();

    if (config.id.empty() || config.tenant_id.empty() || config.name.empty()) {
        cb(error_response("id, tenant_id, and name are required", drogon::k400BadRequest));
        return;
    }

    if (json->isMember("channel_number")) config.channel_number = (*json)["channel_number"].asInt();
    if (json->isMember("codec")) config.codec = (*json)["codec"].asString();
    if (json->isMember("segment_duration_seconds")) {
        config.segment_duration_seconds = (*json)["segment_duration_seconds"].asInt();
    }
    if (json->isMember("playlist_size")) {
        config.playlist_size = (*json)["playlist_size"].asInt();
    }

    auto result = tv_engine_.create_channel(config);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::CONFLICT) {
            cb(error_response(result.error_message(), drogon::k409Conflict));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value body;
    body["channel_id"] = result.value();
    body["message"] = "Channel created";
    cb(json_response(body, drogon::k201Created));
}

void TvRoutes::handle_list_channels(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    std::string tenant_id = req->getOptionalParameter<std::string>("tenant_id").value_or("");
    auto channels = tv_engine_.list_channels(tenant_id);

    Json::Value arr(Json::arrayValue);
    for (const auto& ch : channels) {
        arr.append(status_to_json(ch));
    }

    Json::Value body;
    body["channels"] = arr;
    body["count"] = static_cast<Json::UInt>(channels.size());
    cb(json_response(body, drogon::k200OK));
}

void TvRoutes::handle_get_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = tv_engine_.get_channel_status(channel_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Channel not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    cb(json_response(status_to_json(result.value()), drogon::k200OK));
}

void TvRoutes::handle_start_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = tv_engine_.start_channel(channel_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Channel not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value body;
    body["message"] = "Channel started";
    body["channel_id"] = channel_id;
    body["hls_url"] = result.value().hls_url;
    body["dash_url"] = result.value().dash_url;
    cb(json_response(body, drogon::k200OK));
}

void TvRoutes::handle_stop_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = tv_engine_.stop_channel(channel_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Channel not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value body;
    body["message"] = "Channel stopped";
    body["channel_id"] = channel_id;
    cb(json_response(body, drogon::k200OK));
}

void TvRoutes::handle_get_schedule(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto now = std::chrono::system_clock::now();
    auto end = now + std::chrono::hours(24);

    auto result = tv_engine_.get_schedule(channel_id, now, end);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Channel not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value arr(Json::arrayValue);
    for (const auto& entry : result.value()) {
        arr.append(schedule_to_json(entry));
    }

    Json::Value body;
    body["schedule"] = arr;
    body["channel_id"] = channel_id;
    body["count"] = static_cast<Json::UInt>(result.value().size());
    cb(json_response(body, drogon::k200OK));
}

void TvRoutes::handle_get_epg(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    std::string format = req->getOptionalParameter<std::string>("format").value_or("json");
    int hours = 24;
    auto hours_param = req->getOptionalParameter<std::string>("hours");
    if (hours_param.has_value()) {
        try { hours = std::stoi(hours_param.value()); } catch (...) {}
    }

    if (format == "xmltv") {
        std::string xmltv = tv_engine_.export_xmltv(hours);
        cb(text_response(xmltv, "application/xml; charset=utf-8"));
        return;
    }

    // JSON EPG
    auto epg = tv_engine_.generate_epg(hours);

    Json::Value arr(Json::arrayValue);
    for (const auto& entry : epg) {
        Json::Value j;
        j["channel_id"] = entry.channel_id;
        j["channel_name"] = entry.channel_name;
        j["program"] = program_to_json(entry.program);

        auto tp_to_str = [](std::chrono::system_clock::time_point tp) -> std::string {
            std::time_t t = std::chrono::system_clock::to_time_t(tp);
            std::tm* tm = std::gmtime(&t);
            char buf[32];
            std::strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", tm);
            return std::string(buf);
        };

        j["start_time"] = tp_to_str(entry.start_time);
        j["end_time"] = tp_to_str(entry.end_time);
        arr.append(j);
    }

    Json::Value body;
    body["epg"] = arr;
    body["count"] = static_cast<Json::UInt>(epg.size());
    body["hours_ahead"] = hours;
    cb(json_response(body, drogon::k200OK));
}

} // namespace media::routes
