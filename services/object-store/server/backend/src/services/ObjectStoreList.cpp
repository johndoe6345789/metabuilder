/**
 * @file ObjectStoreList.cpp
 * @brief ObjectStore::list() implementation.
 */

#include "ObjectStore.h"
#include "ObjectStoreUtil.h"

namespace s3
{

std::vector<Json::Value>
ObjectStore::list(int bucketId, const std::string& prefix, int maxKeys)
{
    std::string sql = "SELECT * FROM objects WHERE bucket_id=$1";
    if (!prefix.empty())
        sql += " AND key LIKE $2";
    sql += " ORDER BY key LIMIT " + std::to_string(maxKeys);

    auto r = prefix.empty()
        ? DbPool::get()->execSqlSync(sql, bucketId)
        : DbPool::get()->execSqlSync(sql, bucketId, prefix + "%");

    std::vector<Json::Value> out;
    for (const auto& row : r)
        out.push_back(ObjectStoreUtil::rowToJson(row));
    return out;
}

} // namespace s3
