/**
 * @file S3SearchService.cpp
 * @brief S3SearchService::searchObjects implementation.
 */

#include "S3SearchService.h"

namespace s3
{

S3SearchService::S3SearchService(
    std::shared_ptr<ElasticClient> client)
    : es_(std::move(client))
{
}

void S3SearchService::searchObjects(const std::string& query,
                                    const std::string& bucket,
                                    int page, int size,
                                    EsCallback onOk,
                                    EsErrback onErr)
{
    json must = json::array();
    must.push_back({
        {"multi_match", {
            {"query", query},
            {"fields", {"key", "content_type", "etag"}}
        }}
    });

    if (!bucket.empty()) {
        must.push_back({
            {"term", {{"bucket", bucket}}}
        });
    }

    json body = {
        {"from", page * size},
        {"size", size},
        {"query", {{"bool", {{"must", must}}}}},
        {"highlight", {
            {"fields", {{"key", json::object()}}}
        }}
    };

    spdlog::debug("searchObjects q={} bucket={}", query, bucket);
    es_->search(kObjectsIdx, body, onOk, onErr);
}

} // namespace s3
