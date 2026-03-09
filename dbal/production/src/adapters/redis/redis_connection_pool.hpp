#ifndef DBAL_REDIS_CONNECTION_POOL_HPP
#define DBAL_REDIS_CONNECTION_POOL_HPP

#include <sw/redis++/redis++.h>
#include <string>
#include <memory>

namespace dbal {
namespace adapters {
namespace redis {

/**
 * Connection Pool - Manages redis-plus-plus connection pool
 *
 * Handles connection initialization, testing, and cleanup
 * Provides access to the underlying Redis connection object
 */
class RedisConnectionPool {
public:
    explicit RedisConnectionPool(const std::string& connection_url);
    ~RedisConnectionPool() = default;

    /**
     * Test connection with PING command
     * Returns true if connection is alive
     */
    bool testConnection();

    /**
     * Get underlying Redis connection
     */
    [[nodiscard]] sw::redis::Redis& getConnection() const;

    /**
     * Check if connection is valid
     */
    bool isValid() const;

    /**
     * Close connection and release resources
     */
    void close();

private:
    mutable std::unique_ptr<sw::redis::Redis> redis_;
    std::string connection_url_;
    bool is_valid_;
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_CONNECTION_POOL_HPP
