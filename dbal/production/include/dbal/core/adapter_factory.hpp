#ifndef DBAL_CORE_ADAPTER_FACTORY_HPP
#define DBAL_CORE_ADAPTER_FACTORY_HPP

#include <memory>
#include <string>
#include "adapters/adapter.hpp"
#include "types.hpp"

namespace dbal {
namespace adapters {
namespace sql {
struct SqlConnectionConfig;
}
}

namespace core {

/**
 * Factory for creating database adapter instances based on configuration.
 *
 * Supports 13 database backends:
 * - SQLite (sqlite://)
 * - PostgreSQL (postgresql://, postgres://)
 * - MySQL (mysql://)
 * - MongoDB (mongodb://)
 * - Prisma (prisma://)
 * - Supabase (supabase://)
 * - Redis (redis://)
 * - Cassandra (cassandra://)
 * - Elasticsearch (elasticsearch://, es://)
 * - SurrealDB (surrealdb://, surreal://)
 * - DynamoDB (dynamodb://)
 * - CockroachDB (cockroachdb://)
 * - TiDB (tidb://)
 */
class AdapterFactory {
public:
    /**
     * Create an adapter instance from a database URL.
     *
     * @param database_url Connection string with protocol prefix
     * @return Unique pointer to adapter instance
     * @throws std::invalid_argument if URL format is invalid or adapter not supported
     */
    static std::unique_ptr<adapters::Adapter> createFromUrl(const std::string& database_url);

    /**
     * Create an adapter instance from adapter type and connection details.
     *
     * @param adapter_type Backend type (e.g., "sqlite", "postgres", "mysql")
     * @param connection_string Connection parameters (format varies by backend)
     * @return Unique pointer to adapter instance
     * @throws std::invalid_argument if adapter type not supported
     */
    static std::unique_ptr<adapters::Adapter> createFromType(
        const std::string& adapter_type,
        const std::string& connection_string
    );

    /**
     * Extract adapter type from database URL protocol.
     *
     * @param database_url Connection string
     * @return Adapter type (e.g., "sqlite", "postgres")
     * @throws std::invalid_argument if URL format is invalid
     */
    static std::string extractAdapterType(const std::string& database_url);

    /**
     * Check if an adapter type is supported.
     *
     * @param adapter_type Backend type to check
     * @return true if supported, false otherwise
     */
    static bool isSupported(const std::string& adapter_type);

private:
    static std::unique_ptr<adapters::Adapter> createSQLiteAdapter(const std::string& url);
    static std::unique_ptr<adapters::Adapter> createPostgresAdapter(const std::string& url);
    static std::unique_ptr<adapters::Adapter> createMySQLAdapter(const std::string& url);
    static std::unique_ptr<adapters::Adapter> createMongoDBAdapter(const std::string& url);

    /**
     * Parse a connection URL into a SqlConnectionConfig struct.
     *
     * Supported format: protocol://[user[:password]@]host[:port]/database[?options]
     * Example: postgres://user:pass@localhost:5432/mydb?sslmode=require
     *
     * @param url Connection URL to parse
     * @return SqlConnectionConfig with parsed values
     * @throws std::invalid_argument if URL format is invalid
     */
    static adapters::sql::SqlConnectionConfig parseConnectionUrl(const std::string& url);
};

} // namespace core
} // namespace dbal

#endif // DBAL_CORE_ADAPTER_FACTORY_HPP
