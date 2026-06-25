#ifndef DBAL_CASSANDRA_CONNECTION_MANAGER_HPP
#define DBAL_CASSANDRA_CONNECTION_MANAGER_HPP

#include <cassandra.h>
#include <mutex>
#include <string>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace cassandra {

/**
 * Connection Manager - Handles CassCluster and CassSession lifecycle
 *
 * Responsibilities:
 * - Parse connection URLs (cassandra://host:port/keyspace)
 * - Create and configure CassCluster
 * - Establish CassSession connection
 * - Create keyspace if not exists
 * - Clean shutdown and resource cleanup
 */
class CassandraConnectionManager {
public:
    /**
     * Create connection manager with connection URL
     *
     * @param connection_url Format: cassandra://host:port/keyspace
     */
    explicit CassandraConnectionManager(const std::string& connection_url);

    /**
     * Destructor - ensures clean shutdown
     */
    ~CassandraConnectionManager();

    /**
     * Establish connection to Cassandra cluster
     * Creates keyspace if it doesn't exist
     *
     * @return Error if connection fails
     */
    Result<bool> connect();

    /**
     * Close session and free cluster resources
     */
    void close();

    /**
     * Get active session (nullptr if not connected)
     */
    CassSession* getSession() const;

    /**
     * Get keyspace name
     */
    const std::string& getKeyspace() const;

    /**
     * Check if currently connected
     */
    bool isConnected() const;

private:
    /**
     * Parse connection URL to extract host, port, keyspace
     * Sets host_, port_, keyspace_ member variables
     */
    void parseConnectionUrl(const std::string& url);

    /**
     * Create keyspace if it doesn't exist
     * Uses SimpleStrategy with replication_factor 1
     */
    Result<bool> createKeyspaceIfNotExists();

    /**
     * Execute USE keyspace statement
     */
    Result<bool> useKeyspace();

    // Thread safety
    mutable std::mutex mutex_;

    // Connection components
    CassCluster* cluster_;
    CassSession* session_;

    // Connection parameters
    std::string connection_url_;
    std::string host_;
    int port_;
    std::string keyspace_;

    bool connected_;
};

} // namespace cassandra
} // namespace adapters
} // namespace dbal

#endif // DBAL_CASSANDRA_CONNECTION_MANAGER_HPP
