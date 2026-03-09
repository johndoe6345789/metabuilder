#include "media/dbal_client.hpp"
#include <iostream>
#include <sstream>
#include <thread>
#include <chrono>
#include <cpr/cpr.h>

namespace media {

// Pimpl: holds cpr session state (base URL, headers)
struct DbalClient::Impl {
    std::string base_url;
    std::string api_key;
    int timeout_ms = 5000;
};

DbalClient::DbalClient() : impl_(std::make_unique<Impl>()) {}

DbalClient::~DbalClient() = default;

// ============================================================================
// Initialization
// ============================================================================

Result<void> DbalClient::initialize(const DbalClientConfig& config) {
    config_ = config;
    impl_->base_url = config.url;
    impl_->api_key = config.api_key;
    impl_->timeout_ms = config.timeout_ms;

    initialized_ = true;
    std::cout << "[DbalClient] Initialized, url=" << config.url << std::endl;
    return Result<void>::ok();
}

bool DbalClient::is_connected() const {
    return initialized_;
}

Result<void> DbalClient::ping() {
    if (!initialized_) {
        return Result<void>::error(ErrorCode::SERVICE_UNAVAILABLE, "Not initialized");
    }

    auto result = make_request("GET", "/health");
    if (result.is_error()) {
        return Result<void>::error(result.error_code(), result.error_message());
    }
    return Result<void>::ok();
}

// ============================================================================
// Notifications
// ============================================================================

Result<void> DbalClient::send_notification(const Notification& notification) {
    if (!initialized_) {
        return Result<void>::ok();  // Gracefully skip if DBAL not configured
    }

    // Build JSON body
    std::ostringstream body;
    body << "{"
         << "\"tenant_id\":\"" << notification.tenant_id << "\","
         << "\"user_id\":\"" << notification.user_id << "\","
         << "\"type\":" << static_cast<int>(notification.type) << ","
         << "\"title\":\"" << notification.title << "\","
         << "\"message\":\"" << notification.message << "\","
         << "\"icon\":\"" << notification.icon << "\""
         << "}";

    auto result = make_request(
        "POST",
        "/" + notification.tenant_id + "/media/notification",
        body.str()
    );

    if (result.is_error()) {
        std::cerr << "[DbalClient] Notification failed: " << result.error_message() << std::endl;
        return Result<void>::error(result.error_code(), result.error_message());
    }

    return Result<void>::ok();
}

Result<void> DbalClient::notify_job_started(
    const std::string& tenant_id,
    const std::string& user_id,
    const std::string& job_id,
    JobType job_type
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = user_id;
    n.type = NotificationType::JOB_STARTED;
    n.title = "Job Started";
    n.message = "Your media job has started processing";
    n.icon = "info";
    n.data["job_id"] = job_id;
    n.data["job_type"] = std::to_string(static_cast<int>(job_type));
    return send_notification(n);
}

Result<void> DbalClient::notify_job_progress(
    const std::string& tenant_id,
    const std::string& user_id,
    const std::string& job_id,
    const JobProgress& progress
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = user_id;
    n.type = NotificationType::JOB_PROGRESS;
    n.title = "Job Progress";
    n.message = "Job is " + std::to_string(static_cast<int>(progress.percent)) + "% complete";
    n.icon = "info";
    n.data["job_id"] = job_id;
    n.data["percent"] = std::to_string(progress.percent);
    n.data["stage"] = progress.stage;
    return send_notification(n);
}

Result<void> DbalClient::notify_job_completed(
    const std::string& tenant_id,
    const std::string& user_id,
    const std::string& job_id,
    const std::string& output_path
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = user_id;
    n.type = NotificationType::JOB_COMPLETED;
    n.title = "Job Completed";
    n.message = "Your media job has completed successfully";
    n.icon = "success";
    n.data["job_id"] = job_id;
    n.data["output_path"] = output_path;
    return send_notification(n);
}

Result<void> DbalClient::notify_job_failed(
    const std::string& tenant_id,
    const std::string& user_id,
    const std::string& job_id,
    const std::string& error_message
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = user_id;
    n.type = NotificationType::JOB_FAILED;
    n.title = "Job Failed";
    n.message = "Your media job failed: " + error_message;
    n.icon = "error";
    n.data["job_id"] = job_id;
    n.data["error"] = error_message;
    return send_notification(n);
}

Result<void> DbalClient::notify_stream_started(
    const std::string& tenant_id,
    const std::string& channel_id,
    const std::string& channel_name,
    const std::string& stream_url
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = "";
    n.type = NotificationType::STREAM_STARTED;
    n.title = "Stream Started";
    n.message = "Channel \"" + channel_name + "\" is now live";
    n.icon = "success";
    n.data["channel_id"] = channel_id;
    n.data["stream_url"] = stream_url;
    return send_notification(n);
}

Result<void> DbalClient::notify_stream_stopped(
    const std::string& tenant_id,
    const std::string& channel_id,
    const std::string& channel_name
) {
    Notification n;
    n.tenant_id = tenant_id;
    n.user_id = "";
    n.type = NotificationType::STREAM_STOPPED;
    n.title = "Stream Stopped";
    n.message = "Channel \"" + channel_name + "\" has gone offline";
    n.icon = "info";
    n.data["channel_id"] = channel_id;
    return send_notification(n);
}

// ============================================================================
// Permissions
// ============================================================================

Result<bool> DbalClient::check_permission(
    const std::string& tenant_id,
    const std::string& user_id,
    const std::string& permission
) {
    if (!initialized_) {
        // Permissive default when DBAL not configured
        return Result<bool>::ok(true);
    }

    auto result = make_request(
        "GET",
        "/" + tenant_id + "/auth/permission?user_id=" + user_id
            + "&permission=" + permission
    );

    if (result.is_error()) {
        return Result<bool>::error(result.error_code(), result.error_message());
    }

    // Simple parse: look for "granted":true
    const std::string& body = result.value();
    bool granted = body.find("\"granted\":true") != std::string::npos
                || body.find("\"granted\": true") != std::string::npos;

    return Result<bool>::ok(granted);
}

Result<int> DbalClient::get_user_level(
    const std::string& tenant_id,
    const std::string& user_id
) {
    if (!initialized_) {
        return Result<int>::ok(0);
    }

    auto result = make_request(
        "GET",
        "/" + tenant_id + "/users/" + user_id + "/level"
    );

    if (result.is_error()) {
        return Result<int>::error(result.error_code(), result.error_message());
    }

    // Simple parse: look for "level":N
    const std::string& body = result.value();
    auto pos = body.find("\"level\":");
    if (pos == std::string::npos) {
        return Result<int>::ok(0);
    }
    try {
        int level = std::stoi(body.substr(pos + 8));
        return Result<int>::ok(level);
    } catch (...) {
        return Result<int>::ok(0);
    }
}

// ============================================================================
// Job Storage
// ============================================================================

Result<void> DbalClient::store_job(const JobInfo& job) {
    if (!initialized_) return Result<void>::ok();

    std::ostringstream body;
    body << "{"
         << "\"id\":\"" << job.id << "\","
         << "\"tenant_id\":\"" << job.tenant_id << "\","
         << "\"user_id\":\"" << job.user_id << "\","
         << "\"type\":" << static_cast<int>(job.type) << ","
         << "\"status\":" << static_cast<int>(job.status) << ","
         << "\"priority\":" << static_cast<int>(job.priority)
         << "}";

    auto result = make_request(
        "POST",
        "/" + job.tenant_id + "/media/media_job",
        body.str()
    );

    if (result.is_error()) {
        std::cerr << "[DbalClient] store_job failed: " << result.error_message() << std::endl;
        return Result<void>::error(result.error_code(), result.error_message());
    }

    return Result<void>::ok();
}

Result<void> DbalClient::update_job(const JobInfo& job) {
    if (!initialized_) return Result<void>::ok();

    std::ostringstream body;
    body << "{"
         << "\"status\":" << static_cast<int>(job.status) << ","
         << "\"output_path\":\"" << job.output_path << "\","
         << "\"error_message\":\"" << job.error_message << "\","
         << "\"progress_percent\":" << job.progress.percent
         << "}";

    auto result = make_request(
        "PUT",
        "/" + job.tenant_id + "/media/media_job/" + job.id,
        body.str()
    );

    if (result.is_error()) {
        std::cerr << "[DbalClient] update_job failed: " << result.error_message() << std::endl;
        return Result<void>::error(result.error_code(), result.error_message());
    }

    return Result<void>::ok();
}

Result<JobInfo> DbalClient::get_job(const std::string& job_id) {
    if (!initialized_) {
        return Result<JobInfo>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "DBAL client not initialized"
        );
    }

    auto result = make_request("GET", "/media/media_job/" + job_id);
    if (result.is_error()) {
        return Result<JobInfo>::error(result.error_code(), result.error_message());
    }

    // Minimal parse - return stub; full impl would deserialize JSON
    JobInfo info;
    info.id = job_id;
    return Result<JobInfo>::ok(info);
}

Result<std::vector<JobInfo>> DbalClient::list_jobs(
    const std::string& tenant_id,
    const std::string& user_id,
    size_t limit,
    size_t offset
) {
    if (!initialized_) {
        return Result<std::vector<JobInfo>>::ok({});
    }

    std::string endpoint = "/" + tenant_id + "/media/media_job?limit="
        + std::to_string(limit) + "&offset=" + std::to_string(offset);

    if (!user_id.empty()) {
        endpoint += "&user_id=" + user_id;
    }

    auto result = make_request("GET", endpoint);
    if (result.is_error()) {
        return Result<std::vector<JobInfo>>::error(result.error_code(), result.error_message());
    }

    // Return empty list; real impl would parse JSON array
    return Result<std::vector<JobInfo>>::ok({});
}

// ============================================================================
// Channel Storage
// ============================================================================

Result<void> DbalClient::store_radio_channel(const RadioChannelConfig& config) {
    if (!initialized_) return Result<void>::ok();

    std::ostringstream body;
    body << "{"
         << "\"id\":\"" << config.id << "\","
         << "\"tenant_id\":\"" << config.tenant_id << "\","
         << "\"name\":\"" << config.name << "\","
         << "\"bitrate_kbps\":" << config.bitrate_kbps << ","
         << "\"codec\":\"" << config.codec << "\""
         << "}";

    auto result = make_request(
        "POST",
        "/" + config.tenant_id + "/media/radio_channel",
        body.str()
    );

    if (result.is_error()) {
        std::cerr << "[DbalClient] store_radio_channel failed: " << result.error_message() << std::endl;
        return Result<void>::error(result.error_code(), result.error_message());
    }

    return Result<void>::ok();
}

Result<void> DbalClient::store_tv_channel(const TvChannelConfig& config) {
    if (!initialized_) return Result<void>::ok();

    std::ostringstream body;
    body << "{"
         << "\"id\":\"" << config.id << "\","
         << "\"tenant_id\":\"" << config.tenant_id << "\","
         << "\"name\":\"" << config.name << "\","
         << "\"channel_number\":" << config.channel_number
         << "}";

    auto result = make_request(
        "POST",
        "/" + config.tenant_id + "/media/tv_channel",
        body.str()
    );

    if (result.is_error()) {
        std::cerr << "[DbalClient] store_tv_channel failed: " << result.error_message() << std::endl;
        return Result<void>::error(result.error_code(), result.error_message());
    }

    return Result<void>::ok();
}

Result<std::vector<RadioChannelConfig>> DbalClient::get_radio_channels(
    const std::string& tenant_id
) {
    if (!initialized_) {
        return Result<std::vector<RadioChannelConfig>>::ok({});
    }

    auto result = make_request("GET", "/" + tenant_id + "/media/radio_channel");
    if (result.is_error()) {
        return Result<std::vector<RadioChannelConfig>>::error(
            result.error_code(), result.error_message());
    }

    // Real impl would parse JSON array
    return Result<std::vector<RadioChannelConfig>>::ok({});
}

Result<std::vector<TvChannelConfig>> DbalClient::get_tv_channels(
    const std::string& tenant_id
) {
    if (!initialized_) {
        return Result<std::vector<TvChannelConfig>>::ok({});
    }

    auto result = make_request("GET", "/" + tenant_id + "/media/tv_channel");
    if (result.is_error()) {
        return Result<std::vector<TvChannelConfig>>::error(
            result.error_code(), result.error_message());
    }

    return Result<std::vector<TvChannelConfig>>::ok({});
}

// ============================================================================
// Private
// ============================================================================

Result<std::string> DbalClient::make_request(
    const std::string& method,
    const std::string& endpoint,
    const std::string& body
) {
    if (!initialized_) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "DBAL client not initialized"
        );
    }

    cpr::Header headers = {
        {"Content-Type", "application/json"},
        {"Accept", "application/json"}
    };

    if (!impl_->api_key.empty()) {
        headers["X-API-Key"] = impl_->api_key;
    }

    std::string url = impl_->base_url + endpoint;
    cpr::Response response;

    try {
        if (method == "GET") {
            response = cpr::Get(
                cpr::Url{url},
                headers,
                cpr::Timeout{impl_->timeout_ms}
            );
        } else if (method == "POST") {
            response = cpr::Post(
                cpr::Url{url},
                headers,
                cpr::Body{body},
                cpr::Timeout{impl_->timeout_ms}
            );
        } else if (method == "PUT") {
            response = cpr::Put(
                cpr::Url{url},
                headers,
                cpr::Body{body},
                cpr::Timeout{impl_->timeout_ms}
            );
        } else if (method == "DELETE") {
            response = cpr::Delete(
                cpr::Url{url},
                headers,
                cpr::Timeout{impl_->timeout_ms}
            );
        } else {
            return Result<std::string>::error(
                ErrorCode::VALIDATION_ERROR,
                "Unknown HTTP method: " + method
            );
        }
    } catch (const std::exception& e) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "HTTP request failed: " + std::string(e.what())
        );
    }

    if (response.error.code != cpr::ErrorCode::OK) {
        return Result<std::string>::error(
            ErrorCode::SERVICE_UNAVAILABLE,
            "HTTP error: " + response.error.message
        );
    }

    if (response.status_code >= 400) {
        ErrorCode code = (response.status_code == 404)
            ? ErrorCode::NOT_FOUND
            : (response.status_code == 401)
                ? ErrorCode::UNAUTHORIZED
                : (response.status_code == 403)
                    ? ErrorCode::FORBIDDEN
                    : ErrorCode::INTERNAL_ERROR;
        return Result<std::string>::error(
            code,
            "HTTP " + std::to_string(response.status_code) + ": " + response.text
        );
    }

    return Result<std::string>::ok(response.text);
}

template<typename Func>
auto DbalClient::with_retry(Func&& func) -> decltype(func()) {
    int attempts = config_.retry_attempts;
    while (attempts > 0) {
        auto result = func();
        if (result.is_ok()) return result;
        --attempts;
        if (attempts > 0) {
            std::this_thread::sleep_for(
                std::chrono::milliseconds(config_.retry_delay_ms)
            );
        }
    }
    return func();
}

} // namespace media
