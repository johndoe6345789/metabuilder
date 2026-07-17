/**
 * @file S3SearchIndex.cpp
 * @brief S3SearchService indexing and removal operations.
 */

#include "S3SearchService.h"

#include <chrono>

namespace s3
{

/// @brief Build a doc ID from bucket + key.
static std::string objectDocId(const std::string& bucket,
                               const std::string& key)
{
    return bucket + "/" + key;
}

void S3SearchService::indexObject(const std::string& bucket,
                                  const std::string& key,
                                  const json& metadata,
                                  EsCallback onOk,
                                  EsErrback onErr)
{
    json doc = metadata;
    doc["bucket"] = bucket;
    doc["key"] = key;

    if (!doc.contains("last_modified")) {
        auto now = std::chrono::system_clock::now();
        auto ms = std::chrono::duration_cast<
            std::chrono::milliseconds>(
            now.time_since_epoch()).count();
        doc["last_modified"] = ms;
    }

    spdlog::debug("indexObject {}/{}", bucket, key);
    es_->indexDoc(
        kObjectsIdx, objectDocId(bucket, key),
        doc, onOk, onErr);
}

void S3SearchService::indexBucket(const std::string& bucketName,
                                  const std::string& region,
                                  EsCallback onOk,
                                  EsErrback onErr)
{
    auto now = std::chrono::system_clock::now();
    auto ms = std::chrono::duration_cast<
        std::chrono::milliseconds>(
        now.time_since_epoch()).count();

    json doc = {
        {"name", bucketName},
        {"region", region},
        {"created_at", ms},
        {"object_count", 0}
    };

    spdlog::debug("indexBucket {}", bucketName);
    es_->indexDoc(kBucketsIdx, bucketName, doc, onOk, onErr);
}

void S3SearchService::removeObject(const std::string& bucket,
                                   const std::string& key,
                                   EsCallback onOk,
                                   EsErrback onErr)
{
    spdlog::debug("removeObject {}/{}", bucket, key);
    es_->deleteDoc(
        kObjectsIdx, objectDocId(bucket, key), onOk, onErr);
}

void S3SearchService::removeBucket(const std::string& bucketName,
                                   EsCallback onOk,
                                   EsErrback onErr)
{
    spdlog::debug("removeBucket {}", bucketName);
    es_->deleteDoc(kBucketsIdx, bucketName, onOk, onErr);
}

} // namespace s3
