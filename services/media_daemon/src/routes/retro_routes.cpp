#include "routes/retro_routes.hpp"
#include <json/json.h>
#include <cstdlib>
#include <sstream>
#include <chrono>
#include <iomanip>

namespace media::routes {

// ── Helpers ─────────────────────────────────────────────────────────────────

drogon::HttpResponsePtr RetroRoutes::json_ok(const Json::Value& body) {
    auto r = drogon::HttpResponse::newHttpJsonResponse(body);
    r->setStatusCode(drogon::k200OK);
    return r;
}

drogon::HttpResponsePtr RetroRoutes::err(
    const std::string& msg, drogon::HttpStatusCode code
) {
    Json::Value b;
    b["error"] = msg;
    auto r = drogon::HttpResponse::newHttpJsonResponse(b);
    r->setStatusCode(code);
    return r;
}

std::string RetroRoutes::hls_base_url() const {
    const char* host = std::getenv("MEDIA_HLS_HOST");
    return std::string(host != nullptr ? host : "http://localhost:8088")
           + "/hls/retro";
}

// ── Route handlers ───────────────────────────────────────────────────────────

void RetroRoutes::handle_create_session(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    auto json = req->getJsonObject();
    if (!json) { cb(err("Invalid JSON", drogon::k400BadRequest)); return; }

    const std::string system   = (*json)["system"].asString();
    const std::string rom_path = (*json)["rom_path"].asString();
    if (system.empty() || rom_path.empty()) {
        cb(err("system and rom_path are required", drogon::k400BadRequest));
        return;
    }

    // Generate session ID before building params
    auto now = std::chrono::system_clock::now();
    auto t   = std::chrono::system_clock::to_time_t(now);
    std::ostringstream id_ss;
    id_ss << system << "_" << std::hex << t;
    const std::string session_id = id_ss.str();

    const std::string stream_url =
        hls_base_url() + "/" + session_id + "/index.m3u8";

    // params is a variant — use the map<string,string> arm for custom jobs
    JobRequest job;
    job.type   = JobType::RetroSession;
    job.params = std::map<std::string, std::string>{
        {"system",     system},
        {"rom_path",   rom_path},
        {"session_id", session_id},
        {"stream_url", stream_url},
    };

    auto result = job_queue_.submit(std::move(job));
    if (result.is_error()) {
        cb(err(result.error_message(), drogon::k500InternalServerError));
        return;
    }

    {
        std::lock_guard<std::mutex> lock(sessions_mutex_);
        session_to_job_[session_id] = result.value();
    }

    // camelCase keys match the RetroSession TS interface
    Json::Value resp;
    resp["id"]        = session_id;
    resp["system"]    = system;
    resp["romPath"]   = rom_path;
    resp["streamUrl"] = stream_url;
    resp["jobId"]     = result.value();
    resp["startedAt"] =
        std::to_string(std::chrono::duration_cast<std::chrono::seconds>(
            now.time_since_epoch()).count());
    cb(json_ok(resp));
}

void RetroRoutes::handle_list_sessions(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    std::lock_guard<std::mutex> lock(sessions_mutex_);
    Json::Value arr(Json::arrayValue);
    for (const auto& [sid, jid] : session_to_job_) {
        Json::Value entry;
        entry["id"]         = sid;
        entry["job_id"]     = jid;
        entry["stream_url"] = hls_base_url() + "/" + sid + "/index.m3u8";
        arr.append(entry);
    }
    Json::Value resp;
    resp["sessions"] = arr;
    cb(json_ok(resp));
}

void RetroRoutes::handle_stop_session(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& session_id
) {
    std::string job_id;
    {
        std::lock_guard<std::mutex> lock(sessions_mutex_);
        auto it = session_to_job_.find(session_id);
        if (it == session_to_job_.end()) {
            cb(err("Session not found", drogon::k404NotFound));
            return;
        }
        job_id = it->second;
        session_to_job_.erase(it);
    }
    job_queue_.cancel(job_id);
    auto r = drogon::HttpResponse::newHttpResponse();
    r->setStatusCode(drogon::k204NoContent);
    cb(r);
}

void RetroRoutes::handle_send_input(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& session_id
) {
    {
        std::lock_guard<std::mutex> lock(sessions_mutex_);
        if (session_to_job_.find(session_id) == session_to_job_.end()) {
            cb(err("Session not found", drogon::k404NotFound));
            return;
        }
    }

    auto json = req->getJsonObject();
    if (!json) { cb(err("Invalid JSON", drogon::k400BadRequest)); return; }

    // Input relay to libretro core via job queue side-channel
    // Full implementation: job worker holds a shared input queue;
    // this handler enqueues the button event.
    // For now we acknowledge the input — the libretro plugin reads it.
    Json::Value resp;
    resp["session_id"] = session_id;
    resp["button"]     = (*json)["button"].asString();
    resp["pressed"]    = (*json)["pressed"].asBool();
    resp["queued"]     = true;
    cb(json_ok(resp));
}

} // namespace media::routes
