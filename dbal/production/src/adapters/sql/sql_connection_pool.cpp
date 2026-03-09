#include "sql_connection_pool.hpp"
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal {
namespace adapters {
namespace sql {

SqlConnectionPool::SqlConnectionPool(const SqlConnectionConfig& config)
    : config_(config),
      max_connections_(config.max_connections > 0 ? config.max_connections : 10),
      created_connections_(0) {
    initializePool();
}

SqlConnectionPool::~SqlConnectionPool() {
    std::lock_guard<std::mutex> lock(mutex_);
    while (!available_connections_.empty()) {
        available_connections_.pop();  // unique_ptr auto-deletes
    }
}

void SqlConnectionPool::initializePool() {
    // Create initial connections (min pool size)
    size_t initial_size = max_connections_ / 2;
    if (initial_size < 1) {
        initial_size = 1;
    }

    for (size_t i = 0; i < initial_size; ++i) {
        auto conn = createConnection();
        if (conn) {
            available_connections_.push(std::move(conn));
        }
    }

    spdlog::info("SqlConnectionPool: Initialized with {} connections (max: {})",
                available_connections_.size(), max_connections_);
}

std::unique_ptr<SqlConnection> SqlConnectionPool::createConnection() {
    // This is a placeholder - actual implementation depends on the SQL dialect
    // PostgresAdapter and MySQLAdapter will override connection creation
    return std::make_unique<SqlConnection>(config_);
}

SqlConnection* SqlConnectionPool::acquire() {
    std::lock_guard<std::mutex> lock(mutex_);

    if (!available_connections_.empty()) {
        auto conn = std::move(available_connections_.front());
        available_connections_.pop();
        return conn.release();  // Transfer ownership to caller
    }

    // Pool is empty, try to create a new connection
    if (created_connections_ < max_connections_) {
        auto conn = createConnection();
        if (conn) {
            created_connections_++;
            return conn.release();  // Transfer ownership to caller
        }
    }

    // Pool exhausted
    spdlog::warn("SqlConnectionPool: Pool exhausted (max: {})", max_connections_);
    return nullptr;
}

void SqlConnectionPool::release(SqlConnection* connection) {
    if (!connection) {
        return;
    }

    std::lock_guard<std::mutex> lock(mutex_);
    available_connections_.push(std::unique_ptr<SqlConnection>(connection));  // Reclaim ownership
}

size_t SqlConnectionPool::size() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return created_connections_;
}

size_t SqlConnectionPool::available() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return available_connections_.size();
}

} // namespace sql
} // namespace adapters
} // namespace dbal
