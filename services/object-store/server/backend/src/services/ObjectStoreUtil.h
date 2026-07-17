/**
 * @file ObjectStoreUtil.h
 * @brief Shared helpers for ObjectStore row mapping.
 */

#pragma once

#include <drogon/orm/Row.h>
#include <json/json.h>

namespace s3
{

/// @brief Row-to-JSON helpers for object metadata.
struct ObjectStoreUtil {
    /// @brief Convert a DB row to Json::Value.
    static Json::Value rowToJson(const drogon::orm::Row& row)
    {
        Json::Value j;
        j["key"] = row["key"].as<std::string>();
        j["etag"] = row["etag"].as<std::string>();
        j["size"] = (Json::Int64)row["size"].as<int64_t>();
        j["content_type"] = row["content_type"].as<std::string>();
        j["storage_path"] = row["storage_path"].as<std::string>();
        j["last_modified"] = row["updated_at"].as<std::string>();
        return j;
    }
};

} // namespace s3
