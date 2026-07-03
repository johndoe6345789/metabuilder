/**
 * @file S3IndexInit.h
 * @brief Creates Elasticsearch indices with S3 mappings.
 */

#pragma once

#include "ElasticClient.h"

#include <memory>

namespace s3
{

/// @brief Ensures S3 search indices exist with correct mappings.
class S3IndexInit
{
  public:
    /// @brief Construct with a shared ElasticClient.
    explicit S3IndexInit(
        std::shared_ptr<ElasticClient> client);

    /**
     * @brief Create the s3-buckets index if it does not exist.
     * @param onOk   Success callback.
     * @param onErr  Error callback.
     */
    void createBucketsIndex(EsCallback onOk, EsErrback onErr);

    /**
     * @brief Create the s3-objects index if it does not exist.
     * @param onOk   Success callback.
     * @param onErr  Error callback.
     */
    void createObjectsIndex(EsCallback onOk, EsErrback onErr);

    /**
     * @brief Create both indices. Calls onOk after both succeed.
     * @param onOk   Success callback.
     * @param onErr  Error callback.
     */
    void initAll(EsCallback onOk, EsErrback onErr);

  private:
    std::shared_ptr<ElasticClient> es_;

    /// @brief Build shared index settings JSON.
    static json indexSettings();
};

} // namespace s3
