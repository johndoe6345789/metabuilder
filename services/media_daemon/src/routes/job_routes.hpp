#pragma once
#include "media/job_queue.hpp"
#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace media::routes {

class JobRoutes {
public:
    explicit JobRoutes(JobQueue& jq) : job_queue_(jq) {}

    void handle_create_job(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_list_jobs(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb
    );

    void handle_get_job(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& job_id
    );

    void handle_cancel_job(
        const drogon::HttpRequestPtr& req,
        std::function<void(const drogon::HttpResponsePtr&)>&& cb,
        const std::string& job_id
    );

private:
    JobQueue& job_queue_;

    drogon::HttpResponsePtr json_response(const Json::Value& body, drogon::HttpStatusCode code);
    drogon::HttpResponsePtr error_response(const std::string& message, drogon::HttpStatusCode code);
    std::string job_status_to_str(JobStatus s);
    std::string job_type_to_str(JobType t);
    Json::Value job_to_json(const JobInfo& info);
};

} // namespace media::routes
