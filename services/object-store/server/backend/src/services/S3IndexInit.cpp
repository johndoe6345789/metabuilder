/**
 * @file S3IndexInit.cpp
 * @brief S3IndexInit implementation with index mappings.
 */

#include "S3IndexInit.h"

namespace s3
{

S3IndexInit::S3IndexInit(std::shared_ptr<ElasticClient> client)
    : es_(std::move(client))
{
}

json S3IndexInit::indexSettings()
{
    return {
        {"number_of_shards", 1},
        {"number_of_replicas", 0},
        {"refresh_interval", "1s"}
    };
}

void S3IndexInit::createBucketsIndex(EsCallback onOk,
                                     EsErrback onErr)
{
    json body = {
        {"settings", indexSettings()},
        {"mappings", {{"properties", {
            {"name",         {{"type", "keyword"}}},
            {"region",       {{"type", "keyword"}}},
            {"created_at",   {{"type", "date"}}},
            {"object_count", {{"type", "integer"}}}
        }}}}
    };

    spdlog::info("Creating s3-buckets index");
    es_->createIndex("s3-buckets", body, onOk, onErr);
}

void S3IndexInit::createObjectsIndex(EsCallback onOk,
                                     EsErrback onErr)
{
    json body = {
        {"settings", indexSettings()},
        {"mappings", {{"properties", {
            {"key", {
                {"type", "text"},
                {"fields", {{"raw", {{"type", "keyword"}}}}}
            }},
            {"bucket",        {{"type", "keyword"}}},
            {"content_type",  {{"type", "keyword"}}},
            {"size",          {{"type", "long"}}},
            {"last_modified", {{"type", "date"}}},
            {"etag",          {{"type", "keyword"}}}
        }}}}
    };

    spdlog::info("Creating s3-objects index");
    es_->createIndex("s3-objects", body, onOk, onErr);
}

void S3IndexInit::initAll(EsCallback onOk, EsErrback onErr)
{
    createBucketsIndex(
        [this, onOk, onErr](const json&) {
            createObjectsIndex(onOk, onErr);
        },
        onErr);
}

} // namespace s3
