/**
 * @file DbPool.h
 * @brief PostgreSQL connection pool for S3 server.
 */

#pragma once

#include <drogon/orm/DbClient.h>

#include <string>

namespace s3
{

/// @brief Singleton database connection pool.
class DbPool
{
  public:
    /// @brief Initialize with a PG connection string.
    static void init(const std::string& connStr)
    {
        client_ = drogon::orm::DbClient ::newPgClient(connStr, 4);
    }

    /// @brief Get the shared DbClient.
    static drogon::orm::DbClientPtr& get() { return client_; }

  private:
    static inline drogon::orm::DbClientPtr client_;
};

} // namespace s3
