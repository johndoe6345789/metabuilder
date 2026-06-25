#ifndef DBAL_CONFIG_VALIDATOR_HPP
#define DBAL_CONFIG_VALIDATOR_HPP

#include <string>
#include <stdexcept>
#include <spdlog/spdlog.h>
#include <sys/stat.h>

namespace dbal {
namespace config {

/**
 * Configuration validation utilities
 * Validates configuration values for correctness
 */
class ConfigValidator {
public:
    // Validate port number
    static bool isValidPort(int port) {
        return port > 0 && port <= 65535;
    }

    // Validate directory exists
    static bool directoryExists(const std::string& path) {
        struct stat info;
        if (stat(path.c_str(), &info) != 0) {
            return false;
        }
        return (info.st_mode & S_IFDIR) != 0;
    }

    // Validate log level
    static bool isValidLogLevel(const std::string& level) {
        return level == "trace" || level == "debug" || level == "info" ||
               level == "warn" || level == "error" || level == "critical";
    }

    // Validate database type
    static bool isValidDatabaseType(const std::string& type) {
        return type == "sqlite" || type == "postgres" || type == "mysql" ||
               type == "mariadb" || type == "cockroachdb" || type == "mongodb" ||
               type == "redis" || type == "elasticsearch" || type == "cassandra" ||
               type == "surrealdb" || type == "supabase" || type == "prisma";
    }

    // Validate mode
    static bool isValidMode(const std::string& mode) {
        return mode == "development" || mode == "production";
    }

    // Validate log format
    static bool isValidLogFormat(const std::string& format) {
        return format == "json" || format == "text";
    }

    // Validate pool sizes
    static bool areValidPoolSizes(int min_size, int max_size) {
        return min_size > 0 && max_size > 0 && min_size <= max_size;
    }

    // Validate timeout values
    static bool isValidTimeout(int timeout_seconds) {
        return timeout_seconds > 0 && timeout_seconds <= 3600; // Max 1 hour
    }

    // Validate all configuration values
    static void validate(const std::string& schema_dir,
                        const std::string& template_dir,
                        int port,
                        const std::string& log_level,
                        const std::string& database_type,
                        const std::string& mode,
                        const std::string& log_format,
                        int pool_min_size,
                        int pool_max_size) {

        // Validate required directories
        if (!directoryExists(schema_dir)) {
            spdlog::warn("Schema directory does not exist: {}", schema_dir);
        }
        if (!directoryExists(template_dir)) {
            spdlog::warn("Template directory does not exist: {}", template_dir);
        }

        // Validate port
        if (!isValidPort(port)) {
            throw std::runtime_error("Invalid port number: " + std::to_string(port));
        }

        // Validate log level
        if (!isValidLogLevel(log_level)) {
            spdlog::warn("Invalid log level '{}', using 'info'", log_level);
        }

        // Validate database type
        if (!isValidDatabaseType(database_type)) {
            spdlog::warn("Unknown database type: {}", database_type);
        }

        // Validate mode
        if (!isValidMode(mode)) {
            spdlog::warn("Invalid mode '{}', using 'production'", mode);
        }

        // Validate log format
        if (!isValidLogFormat(log_format)) {
            spdlog::warn("Invalid log format '{}', using 'json'", log_format);
        }

        // Validate pool sizes
        if (!areValidPoolSizes(pool_min_size, pool_max_size)) {
            throw std::runtime_error("Invalid pool sizes: min=" + std::to_string(pool_min_size) +
                                   ", max=" + std::to_string(pool_max_size));
        }

        spdlog::debug("Configuration validation complete");
    }
};

} // namespace config
} // namespace dbal

#endif // DBAL_CONFIG_VALIDATOR_HPP
