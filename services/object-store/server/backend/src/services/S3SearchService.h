/**
 * @file S3SearchService.h
 * @brief Elasticsearch-backed search for S3 buckets and objects.
 */

#pragma once

#include "ElasticClient.h"

#include <string>

namespace s3
{

/// @brief Search and indexing service for S3 resources.
class S3SearchService
{
  public:
    /// @brief Construct with a shared ElasticClient.
    explicit S3SearchService(
        std::shared_ptr<ElasticClient> client);

    /**
     * @brief Full-text search over the s3-objects index.
     * @param query   Search query string.
     * @param bucket  Optional bucket filter (empty = all).
     * @param page    Zero-based page number.
     * @param size    Results per page.
     * @param onOk    Success callback with hits JSON.
     * @param onErr   Error callback.
     */
    void searchObjects(const std::string& query,
                       const std::string& bucket,
                       int page, int size,
                       EsCallback onOk,
                       EsErrback onErr);

    /**
     * @brief Index an S3 object's metadata.
     * @param bucket    Bucket name.
     * @param key       Object key.
     * @param metadata  JSON with content_type, size, etag, etc.
     * @param onOk      Success callback.
     * @param onErr     Error callback.
     */
    void indexObject(const std::string& bucket,
                     const std::string& key,
                     const json& metadata,
                     EsCallback onOk,
                     EsErrback onErr);

    /**
     * @brief Index a bucket.
     * @param bucketName  Name of the bucket.
     * @param region      Bucket region.
     * @param onOk        Success callback.
     * @param onErr       Error callback.
     */
    void indexBucket(const std::string& bucketName,
                     const std::string& region,
                     EsCallback onOk,
                     EsErrback onErr);

    /**
     * @brief Remove an object from the search index.
     * @param bucket  Bucket name.
     * @param key     Object key.
     * @param onOk    Success callback.
     * @param onErr   Error callback.
     */
    void removeObject(const std::string& bucket,
                      const std::string& key,
                      EsCallback onOk,
                      EsErrback onErr);

    /**
     * @brief Remove a bucket from the search index.
     * @param bucketName  Bucket name.
     * @param onOk        Success callback.
     * @param onErr       Error callback.
     */
    void removeBucket(const std::string& bucketName,
                      EsCallback onOk,
                      EsErrback onErr);

  private:
    std::shared_ptr<ElasticClient> es_;
    static constexpr auto kObjectsIdx = "s3-objects";
    static constexpr auto kBucketsIdx = "s3-buckets";
};

} // namespace s3
