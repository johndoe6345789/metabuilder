#include "routes/job_routes.hpp"
#include <json/json.h>
#include <iostream>

namespace media::routes {

// ============================================================================
// Helpers
// ============================================================================

drogon::HttpResponsePtr JobRoutes::json_response(
    const Json::Value& body,
    drogon::HttpStatusCode code
) {
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

drogon::HttpResponsePtr JobRoutes::error_response(
    const std::string& message,
    drogon::HttpStatusCode code
) {
    Json::Value body;
    body["error"] = message;
    return json_response(body, code);
}

std::string JobRoutes::job_status_to_str(JobStatus s) {
    switch (s) {
        case JobStatus::PENDING:    return "pending";
        case JobStatus::QUEUED:     return "queued";
        case JobStatus::PROCESSING: return "processing";
        case JobStatus::COMPLETED:  return "completed";
        case JobStatus::FAILED:     return "failed";
        case JobStatus::CANCELLED:  return "cancelled";
        default:                    return "unknown";
    }
}

std::string JobRoutes::job_type_to_str(JobType t) {
    switch (t) {
        case JobType::VIDEO_TRANSCODE:  return "video_transcode";
        case JobType::AUDIO_TRANSCODE:  return "audio_transcode";
        case JobType::DOCUMENT_CONVERT: return "document_convert";
        case JobType::IMAGE_PROCESS:    return "image_process";
        case JobType::RadioStream:      return "radio_stream";
        case JobType::RadioIngest:      return "radio_ingest";
        case JobType::TvBroadcast:      return "tv_broadcast";
        case JobType::TvSegment:        return "tv_segment";
        case JobType::TvEpgGenerate:    return "tv_epg_generate";
        case JobType::RetroSession:     return "retro_session";
        case JobType::RetroRecord:      return "retro_record";
        case JobType::RetroStream:      return "retro_stream";
        case JobType::CUSTOM:           return "custom";
        default:                        return "unknown";
    }
}

Json::Value JobRoutes::job_to_json(const JobInfo& info) {
    Json::Value j;
    j["id"] = info.id;
    j["tenant_id"] = info.tenant_id;
    j["user_id"] = info.user_id;
    j["type"] = job_type_to_str(info.type);
    j["status"] = job_status_to_str(info.status);
    j["priority"] = static_cast<int>(info.priority);
    j["error_message"] = info.error_message;
    j["output_path"] = info.output_path;

    Json::Value progress;
    progress["percent"] = info.progress.percent;
    progress["stage"] = info.progress.stage;
    progress["eta"] = info.progress.eta;
    j["progress"] = progress;

    return j;
}

// ============================================================================
// Route Handlers
// ============================================================================

void JobRoutes::handle_create_job(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    auto json = req->getJsonObject();
    if (!json) {
        cb(error_response("Invalid JSON body", drogon::k400BadRequest));
        return;
    }

    JobRequest request;
    request.tenant_id = (*json)["tenant_id"].asString();
    request.user_id = (*json)["user_id"].asString();

    // Parse job type
    std::string type_str = (*json)["type"].asString();
    if (type_str == "video_transcode") {
        request.type = JobType::VIDEO_TRANSCODE;
        VideoTranscodeParams params;
        params.input_path = (*json)["input_path"].asString();
        params.output_path = (*json)["output_path"].asString();
        if (json->isMember("codec")) params.codec = (*json)["codec"].asString();
        if (json->isMember("width")) params.width = (*json)["width"].asInt();
        if (json->isMember("height")) params.height = (*json)["height"].asInt();
        if (json->isMember("bitrate_kbps")) params.bitrate_kbps = (*json)["bitrate_kbps"].asInt();
        request.params = params;

    } else if (type_str == "audio_transcode") {
        request.type = JobType::AUDIO_TRANSCODE;
        AudioTranscodeParams params;
        params.input_path = (*json)["input_path"].asString();
        params.output_path = (*json)["output_path"].asString();
        if (json->isMember("codec")) params.codec = (*json)["codec"].asString();
        if (json->isMember("bitrate_kbps")) params.bitrate_kbps = (*json)["bitrate_kbps"].asInt();
        request.params = params;

    } else if (type_str == "document_convert") {
        request.type = JobType::DOCUMENT_CONVERT;
        DocumentConvertParams params;
        params.input_path = (*json)["input_path"].asString();
        params.output_path = (*json)["output_path"].asString();
        params.output_format = (*json)["output_format"].asString();
        if (json->isMember("template_path")) {
            params.template_path = (*json)["template_path"].asString();
        }
        request.params = params;

    } else if (type_str == "image_process") {
        request.type = JobType::IMAGE_PROCESS;
        ImageProcessParams params;
        params.input_path = (*json)["input_path"].asString();
        params.output_path = (*json)["output_path"].asString();
        if (json->isMember("format")) params.format = (*json)["format"].asString();
        if (json->isMember("width")) params.width = (*json)["width"].asInt();
        if (json->isMember("height")) params.height = (*json)["height"].asInt();
        if (json->isMember("quality")) params.quality = (*json)["quality"].asInt();
        request.params = params;

    } else {
        // Custom job
        request.type = JobType::CUSTOM;
        std::map<std::string, std::string> custom_params;
        if (json->isMember("params") && (*json)["params"].isObject()) {
            const auto& params_json = (*json)["params"];
            for (const auto& key : params_json.getMemberNames()) {
                custom_params[key] = params_json[key].asString();
            }
        }
        request.params = custom_params;
    }

    // Priority
    if (json->isMember("priority")) {
        int prio = (*json)["priority"].asInt();
        request.priority = static_cast<JobPriority>(prio);
    }

    if (json->isMember("callback_url")) {
        request.callback_url = (*json)["callback_url"].asString();
    }

    if (request.tenant_id.empty()) {
        cb(error_response("tenant_id is required", drogon::k400BadRequest));
        return;
    }

    auto result = job_queue_.submit(request);
    if (result.is_error()) {
        cb(error_response(result.error_message(), drogon::k500InternalServerError));
        return;
    }

    Json::Value resp_body;
    resp_body["job_id"] = result.value();
    resp_body["status"] = "queued";
    cb(json_response(resp_body, drogon::k202Accepted));
}

void JobRoutes::handle_list_jobs(
    const drogon::HttpRequestPtr& req,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb
) {
    std::string tenant_id = req->getOptionalParameter<std::string>("tenant_id").value_or("");
    std::string user_id = req->getOptionalParameter<std::string>("user_id").value_or("");
    size_t limit = std::stoul(req->getOptionalParameter<std::string>("limit").value_or("100"));
    size_t offset = std::stoul(req->getOptionalParameter<std::string>("offset").value_or("0"));

    auto jobs = job_queue_.list_jobs(tenant_id, user_id, std::nullopt, limit, offset);

    Json::Value body(Json::arrayValue);
    for (const auto& job : jobs) {
        body.append(job_to_json(job));
    }

    Json::Value resp_body;
    resp_body["jobs"] = body;
    resp_body["count"] = static_cast<Json::UInt64>(jobs.size());
    cb(json_response(resp_body, drogon::k200OK));
}

void JobRoutes::handle_get_job(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& job_id
) {
    auto result = job_queue_.get_job(job_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Job not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k500InternalServerError));
        }
        return;
    }

    cb(json_response(job_to_json(result.value()), drogon::k200OK));
}

void JobRoutes::handle_cancel_job(
    const drogon::HttpRequestPtr& /*req*/,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& job_id
) {
    auto result = job_queue_.cancel(job_id);
    if (result.is_error()) {
        if (result.error_code() == ErrorCode::NOT_FOUND) {
            cb(error_response("Job not found", drogon::k404NotFound));
        } else {
            cb(error_response(result.error_message(), drogon::k409Conflict));
        }
        return;
    }

    Json::Value body;
    body["message"] = "Job cancelled";
    body["job_id"] = job_id;
    cb(json_response(body, drogon::k200OK));
}

} // namespace media::routes
