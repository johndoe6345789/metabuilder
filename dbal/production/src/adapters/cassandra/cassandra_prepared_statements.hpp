#ifndef DBAL_CASSANDRA_PREPARED_STATEMENTS_HPP
#define DBAL_CASSANDRA_PREPARED_STATEMENTS_HPP

#include <cassandra.h>
#include <mutex>
#include <string>
#include <unordered_map>
#include <memory>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace cassandra {

/**
 * Prepared Statements Cache - Manages CassPrepared statement lifecycle
 *
 * Responsibilities:
 * - Prepare CQL statements once and cache them
 * - Reuse prepared statements for performance
 * - Automatic cleanup on destruction
 * - Thread-safe caching (future enhancement)
 *
 * Benefits:
 * - Reduced parsing overhead
 * - Better performance for repeated queries
 * - Type safety for parameterized queries
 */
class CassandraPreparedStatements {
public:
    /**
     * Create prepared statements manager
     *
     * @param session Active Cassandra session for preparing statements
     */
    explicit CassandraPreparedStatements(CassSession* session);

    /**
     * Destructor - frees all cached prepared statements
     */
    ~CassandraPreparedStatements();

    /**
     * Get or create prepared statement for CQL query
     *
     * @param cql CQL query string (with ? placeholders)
     * @return Prepared statement (nullptr on error)
     */
    const CassPrepared* getPrepared(const std::string& cql);

    /**
     * Clear all cached prepared statements
     */
    void clear();

    /**
     * Get cache statistics
     */
    size_t getCacheSize() const;

private:
    /**
     * Prepare a CQL statement
     *
     * @param cql CQL query string
     * @return Prepared statement (nullptr on error)
     */
    const CassPrepared* prepareStatement(const std::string& cql);

    // Active session for preparing statements
    CassSession* session_;

    // Thread safety for cache access
    mutable std::mutex cache_mutex_;

    // Cache: CQL string -> prepared statement
    std::unordered_map<std::string, const CassPrepared*> cache_;
};

} // namespace cassandra
} // namespace adapters
} // namespace dbal

#endif // DBAL_CASSANDRA_PREPARED_STATEMENTS_HPP
