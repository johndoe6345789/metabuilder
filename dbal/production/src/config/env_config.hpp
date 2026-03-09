#ifndef DBAL_ENV_CONFIG_HPP
#define DBAL_ENV_CONFIG_HPP

#include "env_parser.hpp"
#include "default_config.hpp"
#include "config_validator.hpp"
#include "config_loader.hpp"
#include <string>
#include <spdlog/spdlog.h>

namespace dbal {
namespace config {

/**
 * Environment-based configuration system (Refactored)
 * All paths and settings configurable via environment variables
 *
 * Architecture:
 *   - EnvParser: Core parsing logic (getRequired, get, getInt, getBool)
 *   - DefaultConfig: Centralized default values
 *   - ConfigValidator: Validation logic for config values
 *   - ConfigLoader: Load .env files
 *   - EnvConfig: High-level API (this file)
 */
class EnvConfig {
public:
    // Load .env file on initialization
    static void loadEnvFile(const std::string& path = "") {
        if (path.empty()) {
            ConfigLoader::loadEnvFileAuto();
        } else {
            ConfigLoader::loadEnvFile(path);
        }
    }

    // Validate all configuration values
    static void validate() {
        ConfigValidator::validate(
            getSchemaDir(),
            getTemplateDir(),
            getPort(),
            getLogLevel(),
            getDatabaseType(),
            getMode(),
            getLogFormat(),
            getPoolMinSize(),
            getPoolMaxSize()
        );
    }

    // ========================================================================
    // Schema and Template Paths (REQUIRED)
    // ========================================================================

    static std::string getSchemaDir() {
        return EnvParser::getRequired("DBAL_SCHEMA_DIR");
    }

    static std::string getTemplateDir() {
        return EnvParser::getRequired("DBAL_TEMPLATE_DIR");
    }

    // ========================================================================
    // Database Configuration
    // ========================================================================

    static std::string getDatabasePath() {
        return EnvParser::get("DBAL_DATABASE_PATH", DefaultConfig::DATABASE_PATH);
    }

    static std::string getDatabaseType() {
        return EnvParser::get("DBAL_DATABASE_TYPE", DefaultConfig::DATABASE_TYPE);
    }

    static std::string getDatabaseHost() {
        return EnvParser::get("DBAL_DATABASE_HOST", DefaultConfig::DATABASE_HOST);
    }

    static int getDatabasePort() {
        return EnvParser::getInt("DBAL_DATABASE_PORT", DefaultConfig::DATABASE_PORT);
    }

    static std::string getDatabaseName() {
        return EnvParser::get("DBAL_DATABASE_NAME", DefaultConfig::DATABASE_NAME);
    }

    static std::string getDatabaseUser() {
        return EnvParser::get("DBAL_DATABASE_USER", DefaultConfig::DATABASE_USER);
    }

    static std::string getDatabasePassword() {
        return EnvParser::get("DBAL_DATABASE_PASSWORD", DefaultConfig::DATABASE_PASSWORD);
    }

    // ========================================================================
    // Server Configuration
    // ========================================================================

    static std::string getBindAddress() {
        return EnvParser::get("DBAL_BIND_ADDRESS", DefaultConfig::BIND_ADDRESS);
    }

    static int getPort() {
        return EnvParser::getInt("DBAL_PORT", DefaultConfig::PORT);
    }

    static std::string getLogLevel() {
        return EnvParser::get("DBAL_LOG_LEVEL", DefaultConfig::LOG_LEVEL);
    }

    static std::string getMode() {
        return EnvParser::get("DBAL_MODE", DefaultConfig::MODE);
    }

    // ========================================================================
    // Feature Flags
    // ========================================================================

    static bool getAutoCreateTables() {
        return EnvParser::getBool("DBAL_AUTO_CREATE_TABLES", DefaultConfig::AUTO_CREATE_TABLES);
    }

    static bool getEnableMetrics() {
        return EnvParser::getBool("DBAL_ENABLE_METRICS", DefaultConfig::ENABLE_METRICS);
    }

    static bool getEnableHealthCheck() {
        return EnvParser::getBool("DBAL_ENABLE_HEALTH_CHECK", DefaultConfig::ENABLE_HEALTH_CHECK);
    }

    // ========================================================================
    // Connection Pool Settings
    // ========================================================================

    static int getPoolMinSize() {
        return EnvParser::getInt("DBAL_POOL_MIN_SIZE", DefaultConfig::POOL_MIN_SIZE);
    }

    static int getPoolMaxSize() {
        return EnvParser::getInt("DBAL_POOL_MAX_SIZE", DefaultConfig::POOL_MAX_SIZE);
    }

    static int getPoolIdleTimeout() {
        return EnvParser::getInt("DBAL_POOL_IDLE_TIMEOUT_SECONDS", DefaultConfig::POOL_IDLE_TIMEOUT_SECONDS);
    }

    // ========================================================================
    // Request Limits
    // ========================================================================

    static int getMaxRequestSize() {
        return EnvParser::getInt("DBAL_MAX_REQUEST_SIZE_MB", DefaultConfig::MAX_REQUEST_SIZE_MB);
    }

    static int getRequestTimeout() {
        return EnvParser::getInt("DBAL_REQUEST_TIMEOUT_SECONDS", DefaultConfig::REQUEST_TIMEOUT_SECONDS);
    }

    // ========================================================================
    // Logging
    // ========================================================================

    static std::string getLogFormat() {
        return EnvParser::get("DBAL_LOG_FORMAT", DefaultConfig::LOG_FORMAT);
    }

    static std::string getLogFile() {
        return EnvParser::get("DBAL_LOG_FILE", DefaultConfig::LOG_FILE);
    }

    // ========================================================================
    // Advanced Configuration
    // ========================================================================

    static bool getLogSqlQueries() {
        return EnvParser::getBool("DBAL_LOG_SQL_QUERIES", DefaultConfig::LOG_SQL_QUERIES);
    }

    static bool getLogPerformance() {
        return EnvParser::getBool("DBAL_LOG_PERFORMANCE", DefaultConfig::LOG_PERFORMANCE);
    }

    static int getMetadataCacheTtl() {
        return EnvParser::getInt("DBAL_METADATA_CACHE_TTL", DefaultConfig::METADATA_CACHE_TTL_SECONDS);
    }

    // ========================================================================
    // Debugging
    // ========================================================================

    // Print all configuration (for debugging)
    static void printConfig() {
        spdlog::info("=== DBAL Configuration ===");
        spdlog::info("Schema Dir: {}", getSchemaDir());
        spdlog::info("Template Dir: {}", getTemplateDir());
        spdlog::info("Database Type: {}", getDatabaseType());
        spdlog::info("Database Path: {}", getDatabasePath());
        spdlog::info("Bind Address: {}:{}", getBindAddress(), getPort());
        spdlog::info("Log Level: {}", getLogLevel());
        spdlog::info("Mode: {}", getMode());
        spdlog::info("Auto Create Tables: {}", getAutoCreateTables());
        spdlog::info("Pool Size: {} - {}", getPoolMinSize(), getPoolMaxSize());
        spdlog::info("==========================");
    }
};

} // namespace config
} // namespace dbal

#endif // DBAL_ENV_CONFIG_HPP
