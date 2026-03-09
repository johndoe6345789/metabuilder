#pragma once
#include <spdlog/spdlog.h>
#include <json/json.h>
#include <drogon/HttpRequest.h>

namespace dbal {
namespace daemon {

inline void trace_request(const std::string& handler, const drogon::HttpRequestPtr& req) {
    spdlog::trace("[{}] METHOD={} PATH={} QUERY_PARAMS={} BODY_SIZE={} HEADERS={}",
                 handler, 
                 req->getMethodString(),
                 req->path(),
                 req->getParameters().size(),
                 req->getBody().size(),
                 req->getHeaders().size());
    
    // Log all query parameters
    for (const auto& [k, v] : req->getParameters()) {
        spdlog::trace("[{}] QUERY: {}={}", handler, k, v);
    }
    
    // Log important headers
    for (const auto& [k, v] : req->getHeaders()) {
        if (k == "content-type" || k == "accept" || k == "user-agent") {
            spdlog::trace("[{}] HEADER: {}={}", handler, k, v);
        }
    }
}

inline void trace_response(const std::string& handler, int status_code, const std::string& body_preview = "") {
    spdlog::trace("[{}] RESPONSE: status={} body_size={} preview='{}'",
                 handler, status_code, body_preview.size(),
                 body_preview.size() > 100 ? body_preview.substr(0, 100) + "..." : body_preview);
}

} // namespace daemon
} // namespace dbal
