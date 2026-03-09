#include "routes/radio_routes.hpp"
#include <json/json.h>
#include <iostream>

namespace media::routes {

// ============================================================================
// Helpers
// ============================================================================

drogon::HttpResponsePtr RadioRoutes::json_response(
    const Json::Value& body,
    drogon::HttpStatusCode code
) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

drogon::HttpResponsePtr RadioRoutes::error_response(
    const std::string& message,
    drogon::HttpStatusCode code
) {
    Json::Value body;
    body["error"] = message;
    return json_response(body, code);
}

Json::Value RadioRoutes::status_to_json(const RadioChannelStatus& s) {
    Json::Value j;
    j["id"] = s.id;
    j["name"] = s.name;
    j["is_live"] = s.is_live;
    j["listeners"] = s.listeners;
    j["uptime_seconds"] = s.uptime_seconds;
    j["stream_url"] = s.stream_url;

    if (s.now_playing.has_value()) {
        Json::Value np;
        np["id"] = s.now_playing->id;
        np["title"] = s.now_playing->title;
        np["artist"] = s.now_playing->artist;
        np["album"] = s.now_playing->album;
        np["duration_ms"] = s.now_playing->duration_ms;
        np["artwork_url"] = s.now_playing->artwork_url;
        j["now_playing"] = np;
    }

    if (s.next_track.has_value()) {
        Json::Value nt;
        nt["id"] = s.next_track->id;
        nt["title"] = s.next_track->title;
        nt["artist"] = s.next_track->artist;
        j["next_track"] = nt;
    }

    return j;
}

// ============================================================================
// Route Handlers
// ============================================================================

void RadioRoutes::handle_create_channel(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    auto json = req->getJsonObject();
    if (!json) {
        cb(error_response("Invalid JSON body", drogon::k400BadRequest));
        return;
    }

    RadioChannelConfig config;
    config.id = (*json)["id"].asString();
    config.tenant_id = (*json)["tenant_id"].asString();
    config.name = (*json)["name"].asString();
    config.description = (*json).get("description", "").asString();

    if (config.id.empty() || config.tenant_id.empty() || config.name.empty()) {
        cb(error_response("id, tenant_id, and name are required", drogon::k400BadRequest));
        return;
    }

    if (json->isMember("bitrate_kbps")) config.bitrate_kbps = (*json)["bitrate_kbps"].asInt();
    if (json->isMember("codec")) config.codec = (*json)["codec"].asString();
    if (json->isMember("sample_rate")) config.sample_rate = (*json)["sample_rate"].asInt();
    if (json->isMember("crossfade_enabled")) config.crossfade_enabled = (*json)["crossfade_enabled"].asBool();
    if (json->isMember("crossfade_ms")) config.crossfade_ms = (*json)["crossfade_ms"].asInt();
    if (json->isMember("auto_dj_enabled")) config.auto_dj_enabled = (*json)["auto_dj_enabled"].asBool();
    if (json->isMember("shuffle")) config.shuffle = (*json)["shuffle"].asBool();

    auto result = radio_engine_.create_channel(config);
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

void RadioRoutes::handle_list_channels(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    std::string tenant_id = req->getOptionalParameter<std::string>("tenant_id").value_or("");
    auto channels = radio_engine_.list_channels(tenant_id);

    Json::Value arr(Json::arrayValue);
    for (const auto& ch : channels) {
        arr.append(status_to_json(ch));
    }

    Json::Value body;
    body["channels"] = arr;
    body["count"] = static_cast<Json::UInt>(channels.size());
    cb(json_response(body, drogon::k200OK));
}

void RadioRoutes::handle_get_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = radio_engine_.get_channel_status(channel_id);
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

void RadioRoutes::handle_start_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = radio_engine_.start_channel(channel_id);
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
    body["stream_url"] = result.value();
    body["channel_id"] = channel_id;
    cb(json_response(body, drogon::k200OK));
}

void RadioRoutes::handle_stop_channel(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = radio_engine_.stop_channel(channel_id);
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

void RadioRoutes::handle_set_playlist(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto json = req->getJsonObject();
    if (!json) {
        cb(error_response("Invalid JSON body", drogon::k400BadRequest));
        return;
    }

    std::vector<RadioTrack> tracks;
    if (json->isMember("tracks") && (*json)["tracks"].isArray()) {
        for (const auto& t : (*json)["tracks"]) {
            RadioTrack track;
            track.id = t.get("id", "").asString();
            track.path = t.get("path", "").asString();
            track.title = t.get("title", "").asString();
            track.artist = t.get("artist", "").asString();
            track.album = t.get("album", "").asString();
            track.duration_ms = t.get("duration_ms", 0).asInt();

            if (track.id.empty()) track.id = track.path;
            if (!track.path.empty()) {
                tracks.push_back(track);
            }
        }
    }

    auto result = radio_engine_.set_playlist(channel_id, tracks);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Channel not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    Json::Value body;
    body["message"] = "Playlist updated";
    body["track_count"] = static_cast<Json::UInt>(tracks.size());
    cb(json_response(body, drogon::k200OK));
}

void RadioRoutes::handle_now_playing(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& channel_id
) {
    auto result = radio_engine_.get_now_playing(channel_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            // Could be channel not found or nothing playing
            Json::Value body;
            body["now_playing"] = Json::nullValue;
            body["channel_id"] = channel_id;
            cb(json_response(body, drogon::k200OK));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    const auto& track = result.value();
    Json::Value j;
    j["id"] = track.id;
    j["title"] = track.title;
    j["artist"] = track.artist;
    j["album"] = track.album;
    j["duration_ms"] = track.duration_ms;
    j["artwork_url"] = track.artwork_url;

    Json::Value body;
    body["now_playing"] = j;
    body["channel_id"] = channel_id;
    cb(json_response(body, drogon::k200OK));
}

void RadioRoutes::handle_stream(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& mount
) {
    // Verify the channel exists and is live
    auto status_result = radio_engine_.get_channel_status(mount);
    if (status_result.is_error() || !status_result.value().is_live) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k404NotFound);
        cb(resp);
        return;
    }

    if (!broadcaster_) {
        // Broadcaster not wired up — return 503
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k503ServiceUnavailable);
        cb(resp);
        return;
    }

    const auto& info = status_result.value();

    // Create the async streaming response; the callback runs when Drogon
    // is ready to send — we register the ResponseStreamPtr with the broadcaster.
    auto resp = drogon::HttpResponse::newAsyncStreamResponse(
        [mount, this](drogon::ResponseStreamPtr stream) {
            broadcaster_->add_listener(mount, std::move(stream));
        }
    );

    resp->setContentTypeString("audio/mpeg");
    resp->addHeader("icy-name", info.name);
    resp->addHeader("icy-br", "128");
    resp->addHeader("icy-metaint", "0");
    resp->addHeader("Cache-Control", "no-cache");
    cb(resp);
}

} // namespace media::routes
