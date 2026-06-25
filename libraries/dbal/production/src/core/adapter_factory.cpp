#include "dbal/core/adapter_factory.hpp"
#include "../adapters/sqlite/sqlite_adapter.hpp"
#include "../adapters/sql/postgres_adapter.hpp"
#include "../adapters/sql/mysql_adapter.hpp"
#include "../adapters/mongodb/mongodb_adapter.hpp"
#include <stdexcept>
#include <algorithm>
#include <cctype>
#include <cstdlib>

namespace dbal {
namespace core {

std::unique_ptr<adapters::Adapter> AdapterFactory::createFromUrl(const std::string& database_url) {
    if (database_url.empty()) {
        throw std::invalid_argument("Database URL cannot be empty");
    }

    // If URL has no protocol prefix, check DBAL_ADAPTER env var
    if (database_url.find("://") == std::string::npos) {
        const char* adapter_env = std::getenv("DBAL_ADAPTER");
        std::string adapter_type = adapter_env ? adapter_env : "sqlite";
        return createFromType(adapter_type, database_url);
    }

    std::string adapter_type = extractAdapterType(database_url);
    return createFromType(adapter_type, database_url);
}

std::unique_ptr<adapters::Adapter> AdapterFactory::createFromType(
    const std::string& adapter_type,
    const std::string& connection_string
) {
    std::string lower_type = adapter_type;
    std::transform(lower_type.begin(), lower_type.end(), lower_type.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    if (lower_type == "sqlite") {
        return createSQLiteAdapter(connection_string);
    } else if (lower_type == "postgres" || lower_type == "postgresql") {
        return createPostgresAdapter(connection_string);
    } else if (lower_type == "mysql") {
        return createMySQLAdapter(connection_string);
    } else if (lower_type == "mongodb") {
        return createMongoDBAdapter(connection_string);
    }

    throw std::invalid_argument("Unsupported adapter type: " + adapter_type);
}

std::string AdapterFactory::extractAdapterType(const std::string& database_url) {
    size_t pos = database_url.find("://");
    if (pos == std::string::npos) {
        throw std::invalid_argument("Invalid database URL format. Expected: protocol://...");
    }

    std::string protocol = database_url.substr(0, pos);

    // Normalize protocol variants
    if (protocol == "postgresql") {
        return "postgres";
    } else if (protocol == "mongodb+srv") {
        return "mongodb";
    } else if (protocol == "elasticsearch" || protocol == "es") {
        return "elasticsearch";
    } else if (protocol == "surrealdb" || protocol == "surreal") {
        return "surrealdb";
    }

    return protocol;
}

bool AdapterFactory::isSupported(const std::string& adapter_type) {
    std::string lower_type = adapter_type;
    std::transform(lower_type.begin(), lower_type.end(), lower_type.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    return lower_type == "sqlite" ||
           lower_type == "postgres" ||
           lower_type == "postgresql" ||
           lower_type == "mysql" ||
           lower_type == "mongodb" ||
           lower_type == "prisma" ||
           lower_type == "supabase" ||
           lower_type == "redis" ||
           lower_type == "cassandra" ||
           lower_type == "elasticsearch" ||
           lower_type == "es" ||
           lower_type == "surrealdb" ||
           lower_type == "surreal" ||
           lower_type == "dynamodb" ||
           lower_type == "cockroachdb" ||
           lower_type == "tidb";
}

std::unique_ptr<adapters::Adapter> AdapterFactory::createSQLiteAdapter(const std::string& url) {
    // Extract path from sqlite://path/to/db.sqlite
    size_t pos = url.find("://");
    std::string path = (pos != std::string::npos) ? url.substr(pos + 3) : url;

    return std::make_unique<adapters::sqlite::SQLiteAdapter>(path);
}

std::unique_ptr<adapters::Adapter> AdapterFactory::createPostgresAdapter(const std::string& url) {
    adapters::sql::SqlConnectionConfig config = parseConnectionUrl(url);
    return std::make_unique<adapters::sql::PostgresAdapter>(config);
}

std::unique_ptr<adapters::Adapter> AdapterFactory::createMySQLAdapter(const std::string& url) {
    adapters::sql::SqlConnectionConfig config = parseConnectionUrl(url);
    return std::make_unique<adapters::sql::MySQLAdapter>(config);
}

std::unique_ptr<adapters::Adapter> AdapterFactory::createMongoDBAdapter(const std::string& url) {
    // MongoDB URLs carry their own auth/host/options — pass the full URL as connectionString.
    // Extract the database name from the path segment: mongodb://host:port/database
    adapters::mongodb::MongoDBConfig config;
    config.connectionString = url;

    size_t protocol_end = url.find("://");
    if (protocol_end != std::string::npos) {
        std::string remaining = url.substr(protocol_end + 3);
        // Strip query string
        size_t q = remaining.find('?');
        if (q != std::string::npos) remaining = remaining.substr(0, q);
        // Find the last slash (after host or after @host)
        size_t slash = remaining.find('/');
        if (slash != std::string::npos) {
            config.database = remaining.substr(slash + 1);
        }
    }

    if (config.database.empty()) {
        config.database = "metabuilder";
    }

    return std::make_unique<adapters::mongodb::MongoDBAdapter>(config);
}

adapters::sql::SqlConnectionConfig AdapterFactory::parseConnectionUrl(const std::string& url) {
    adapters::sql::SqlConnectionConfig config;

    // Parse connection URL format: protocol://[user[:password]@]host[:port]/database[?options]
    // Example: postgres://user:pass@localhost:5432/mydb?sslmode=require

    size_t protocol_end = url.find("://");
    if (protocol_end == std::string::npos) {
        throw std::invalid_argument("Invalid connection URL format: missing '://'");
    }

    std::string remaining = url.substr(protocol_end + 3);

    // Extract user:password@ if present
    size_t at_pos = remaining.find('@');
    if (at_pos != std::string::npos) {
        std::string credentials = remaining.substr(0, at_pos);
        remaining = remaining.substr(at_pos + 1);

        size_t colon_pos = credentials.find(':');
        if (colon_pos != std::string::npos) {
            config.user = credentials.substr(0, colon_pos);
            config.password = credentials.substr(colon_pos + 1);
        } else {
            config.user = credentials;
        }
    }

    // Extract options (?key=value&key2=value2)
    size_t options_pos = remaining.find('?');
    if (options_pos != std::string::npos) {
        config.options = remaining.substr(options_pos + 1);
        remaining = remaining.substr(0, options_pos);
    }

    // Extract database (/dbname)
    size_t slash_pos = remaining.find('/');
    if (slash_pos != std::string::npos) {
        config.database = remaining.substr(slash_pos + 1);
        remaining = remaining.substr(0, slash_pos);
    }

    // Extract host:port
    size_t colon_pos = remaining.find(':');
    if (colon_pos != std::string::npos) {
        config.host = remaining.substr(0, colon_pos);
        std::string port_str = remaining.substr(colon_pos + 1);
        try {
            config.port = std::stoi(port_str);
        } catch (const std::exception&) {
            throw std::invalid_argument("Invalid port number in connection URL: " + port_str);
        }
    } else {
        config.host = remaining;
        // Set default ports based on dialect
        // Will be determined by caller
    }

    return config;
}

} // namespace core
} // namespace dbal
