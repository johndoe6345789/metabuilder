#ifndef DBAL_SQL_CONNECTION_POOL_HPP
#define DBAL_SQL_CONNECTION_POOL_HPP

#include <memory>
#include <mutex>
#include <queue>
#include <string>
#include "sql_connection.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SQL Connection Pool - Manages database connection pooling
 *
 * Handles:
 * - Connection acquisition and release
 * - Pool size management
 * - Connection health checks
 * - Thread-safe connection management
 */
class SqlConnectionPool {
public:
    explicit SqlConnectionPool(const SqlConnectionConfig& config);
    ~SqlConnectionPool();

    /**
     * Acquire a connection from the pool
     * Returns nullptr if pool is exhausted
     */
    SqlConnection* acquire();

    /**
     * Release a connection back to the pool
     */
    void release(SqlConnection* connection);

    /**
     * Get current pool size
     */
    size_t size() const;

    /**
     * Get number of available connections
     */
    size_t available() const;

private:
    void initializePool();
    std::unique_ptr<SqlConnection> createConnection();

    SqlConnectionConfig config_;
    std::queue<std::unique_ptr<SqlConnection>> available_connections_;
    mutable std::mutex mutex_;
    size_t max_connections_;
    size_t created_connections_;
};

/**
 * RAII Connection Guard - Automatically releases connection on scope exit
 */
class ConnectionGuard {
public:
    ConnectionGuard(SqlConnectionPool& pool, SqlConnection* connection)
        : pool_(pool), connection_(connection) {}

    ~ConnectionGuard() {
        if (connection_) {
            pool_.release(connection_);
        }
    }

    SqlConnection* get() const { return connection_; }

private:
    SqlConnectionPool& pool_;
    SqlConnection* connection_;
};

} // namespace sql
} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_CONNECTION_POOL_HPP
