/**
 * @file BucketStore.h
 * @brief PostgreSQL-backed bucket metadata store.
 */

#pragma once

#include "DbPool.h"

#include <json/json.h>

#include <string>
#include <vector>

namespace s3
{

/// @brief CRUD operations for S3 buckets.
class BucketStore
{
  public:
    /**
     * @brief Create a bucket.
     * @param name   Bucket name.
     * @param region AWS-style region string.
     * @return true on success, false if the bucket
     *         already exists (unique constraint).
     * @throws drogon::orm::DrogonDbException on
     *         unexpected DB errors.
     */
    static bool create(const std::string& name,
                       const std::string& region);

    /**
     * @brief Get bucket metadata by name.
     * @param name Bucket name.
     * @return Json::Value with id/name/region/created_at,
     *         or Json::nullValue if not found.
     */
    static Json::Value get(const std::string& name);

    /// @brief List all buckets ordered by name.
    static std::vector<Json::Value> list();

    /**
     * @brief Delete a bucket (cascade deletes objects).
     * @param name Bucket name.
     * @return true if a row was deleted.
     */
    static bool remove(const std::string& name);

    /**
     * @brief Get bucket ID by name.
     * @param name Bucket name.
     * @return Positive integer ID, or 0 if not found.
     */
    static int getId(const std::string& name);

  private:
    /// @brief Map a DB row to a Json::Value.
    static Json::Value rowToJson(
        const drogon::orm::Row& row);
};

} // namespace s3
