#ifndef DBAL_MONGODB_CONNECTION_MANAGER_HPP
#define DBAL_MONGODB_CONNECTION_MANAGER_HPP

#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <string>

namespace dbal {
namespace adapters {
namespace mongodb {

/**
 * MongoDB Connection Manager - Handles client connections and URI parsing
 *
 * Responsibilities:
 * - Parse MongoDB connection strings
 * - Establish and maintain client connections
 * - Provide access to database handles
 * - Thread-safe singleton instance management
 */
class MongoDBConnectionManager {
public:
    /**
     * Constructor - Initializes MongoDB client from connection string
     * @param connection_string MongoDB URI (e.g., "mongodb://localhost:27017")
     * @param database_name Database name to use
     * @throws std::runtime_error if connection fails
     */
    MongoDBConnectionManager(const std::string& connection_string,
                            const std::string& database_name);

    ~MongoDBConnectionManager() = default;

    // Disable copy (mongocxx::client is not copyable)
    MongoDBConnectionManager(const MongoDBConnectionManager&) = delete;
    MongoDBConnectionManager& operator=(const MongoDBConnectionManager&) = delete;

    // Enable move
    MongoDBConnectionManager(MongoDBConnectionManager&&) noexcept = default;
    MongoDBConnectionManager& operator=(MongoDBConnectionManager&&) noexcept = default;

    /**
     * Get reference to MongoDB client
     */
    mongocxx::client& getClient();

    /**
     * Get reference to database handle
     */
    mongocxx::database& getDatabase();

    /**
     * Get database name
     */
    const std::string& getDatabaseName() const;

    /**
     * Test connection by pinging the server
     * @return true if connected successfully
     */
    bool testConnection();

private:
    mongocxx::client client_;
    mongocxx::database database_;
    std::string database_name_;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_CONNECTION_MANAGER_HPP
