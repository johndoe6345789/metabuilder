/**
 * @file ObjectStore.h
 * @brief PostgreSQL-backed S3 object metadata store.
 */

#pragma once

#include "DbPool.h"
#include "ObjectStoreUtil.h"

#include <json/json.h>

#include <string>
#include <vector>

namespace s3
{

/// @brief CRUD for object metadata in PostgreSQL.
class ObjectStore
{
  public:
    /// @brief Upsert object metadata.
    static void put(int bucketId, const std::string& key,
                    const std::string& etag, int64_t size,
                    const std::string& contentType,
                    const std::string& storagePath)
    {
        DbPool::get()->execSqlSync("INSERT INTO objects "
                                   "(bucket_id,key,etag,size,"
                                   "content_type,storage_path) "
                                   "VALUES ($1,$2,$3,$4,$5,$6) "
                                   "ON CONFLICT (bucket_id,key) DO UPDATE SET "
                                   "etag=$3, size=$4, content_type=$5, "
                                   "storage_path=$6, updated_at=now()",
                                   bucketId, key, etag, size, contentType,
                                   storagePath);
    }

    /// @brief Get object metadata.
    static Json::Value get(int bucketId, const std::string& key)
    {
        auto r = DbPool::get()->execSqlSync("SELECT * FROM objects "
                                            "WHERE bucket_id=$1 AND key=$2",
                                            bucketId, key);
        if (r.empty())
            return Json::nullValue;
        return ObjectStoreUtil::rowToJson(r[0]);
    }

    /// @brief List objects with optional prefix.
    static std::vector<Json::Value>
    list(int bucketId, const std::string& prefix, int maxKeys = 1000);

    /// @brief Delete object, return storage_path.
    static std::string remove(int bucketId, const std::string& key)
    {
        auto r = DbPool::get()->execSqlSync("DELETE FROM objects "
                                            "WHERE bucket_id=$1 AND key=$2 "
                                            "RETURNING storage_path",
                                            bucketId, key);
        if (r.empty())
            return {};
        return r[0]["storage_path"].as<std::string>();
    }
};

} // namespace s3
