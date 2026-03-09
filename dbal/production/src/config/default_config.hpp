#ifndef DBAL_DEFAULT_CONFIG_HPP
#define DBAL_DEFAULT_CONFIG_HPP

#include <string>

namespace dbal {
namespace config {

/**
 * Default configuration values
 * Centralized location for all defaults across the system
 */
struct DefaultConfig {
    // Database defaults
    static constexpr const char* DATABASE_PATH = "/app/data/dbal.db";
    static constexpr const char* DATABASE_TYPE = "sqlite";
    static constexpr const char* DATABASE_HOST = "localhost";
    static constexpr int DATABASE_PORT = 5432;
    static constexpr const char* DATABASE_NAME = "dbal";
    static constexpr const char* DATABASE_USER = "dbal";
    static constexpr const char* DATABASE_PASSWORD = "";

    // Server defaults
    static constexpr const char* BIND_ADDRESS = "0.0.0.0";
    static constexpr int PORT = 8080;
    static constexpr const char* LOG_LEVEL = "info";
    static constexpr const char* MODE = "production";

    // Feature flags
    static constexpr bool AUTO_CREATE_TABLES = true;
    static constexpr bool ENABLE_METRICS = true;
    static constexpr bool ENABLE_HEALTH_CHECK = true;

    // Connection pool settings
    static constexpr int POOL_MIN_SIZE = 2;
    static constexpr int POOL_MAX_SIZE = 10;
    static constexpr int POOL_IDLE_TIMEOUT_SECONDS = 300;

    // Request limits
    static constexpr int MAX_REQUEST_SIZE_MB = 10;
    static constexpr int REQUEST_TIMEOUT_SECONDS = 30;

    // Logging
    static constexpr const char* LOG_FORMAT = "json";
    static constexpr const char* LOG_FILE = "";

    // Advanced settings
    static constexpr bool LOG_SQL_QUERIES = false;
    static constexpr bool LOG_PERFORMANCE = false;
    static constexpr int METADATA_CACHE_TTL_SECONDS = 3600;
};

} // namespace config
} // namespace dbal

#endif // DBAL_DEFAULT_CONFIG_HPP
