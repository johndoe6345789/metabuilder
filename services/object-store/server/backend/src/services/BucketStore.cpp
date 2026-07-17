/**
 * @file BucketStore.cpp
 * @brief PostgreSQL-backed bucket metadata store impl.
 */

#include "BucketStore.h"

#include <drogon/orm/Exception.h>

#include <stdexcept>

namespace s3
{

bool BucketStore::create(const std::string& name,
                         const std::string& region,
                         const std::string& owner)
{
    try {
        DbPool::get()->execSqlSync(
            "INSERT INTO buckets (name, region, owner) "
            "VALUES ($1, $2, $3)",
            name, region, owner);
        return true;
    } catch (const drogon::orm::DrogonDbException& e) {
        // Unique-constraint violation → bucket exists.
        std::string msg = e.base().what();
        if (msg.find("unique") != std::string::npos ||
            msg.find("duplicate") !=
                std::string::npos) {
            return false;
        }
        throw; // Re-throw unexpected DB errors.
    }
}

Json::Value BucketStore::get(const std::string& name,
                             const std::string& owner)
{
    auto r = DbPool::get()->execSqlSync(
        "SELECT * FROM buckets WHERE name=$1 AND owner=$2", name, owner);
    if (r.empty())
        return Json::nullValue;
    return rowToJson(r[0]);
}

std::vector<Json::Value> BucketStore::list(const std::string& owner)
{
    auto r = DbPool::get()->execSqlSync(
        "SELECT * FROM buckets WHERE owner=$1 ORDER BY name", owner);
    std::vector<Json::Value> out;
    for (const auto& row : r)
        out.push_back(rowToJson(row));
    return out;
}

bool BucketStore::remove(const std::string& name,
                         const std::string& owner)
{
    auto r = DbPool::get()->execSqlSync(
        "DELETE FROM buckets WHERE name=$1 AND owner=$2 "
        "RETURNING id",
        name, owner);
    return !r.empty();
}

int BucketStore::getId(const std::string& name,
                       const std::string& owner)
{
    auto r = DbPool::get()->execSqlSync(
        "SELECT id FROM buckets WHERE name=$1 AND owner=$2", name, owner);
    if (r.empty())
        return 0;
    // Read the id as a string first, then convert to
    // int. This avoids binary vs text protocol
    // ambiguity in Drogon's Field::as<int>() which
    // can silently return 0 for integer columns.
    try {
        return std::stoi(
            r[0]["id"].as<std::string>());
    } catch (const std::exception&) {
        return 0;
    }
}

Json::Value BucketStore::rowToJson(
    const drogon::orm::Row& row)
{
    Json::Value j;
    j["id"] = std::stoi(row["id"].as<std::string>());
    j["name"] = row["name"].as<std::string>();
    j["region"] = row["region"].as<std::string>();
    j["owner"] = row["owner"].as<std::string>();
    j["created_at"] =
        row["created_at"].as<std::string>();
    return j;
}

} // namespace s3
