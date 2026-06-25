#ifndef DBAL_CONFIG_LOADER_HPP
#define DBAL_CONFIG_LOADER_HPP

#include <string>
#include <fstream>
#include <spdlog/spdlog.h>
#include <cstdlib>

namespace dbal {
namespace config {

/**
 * Configuration file loader
 * Loads .env files and sets environment variables
 */
class ConfigLoader {
public:
    // Load .env file from path
    static bool loadEnvFile(const std::string& path) {
        std::ifstream file(path);
        if (!file.is_open()) {
            spdlog::warn("Could not open .env file: {}", path);
            return false;
        }

        std::string line;
        int count = 0;
        while (std::getline(file, line)) {
            // Skip empty lines and comments
            if (line.empty() || line[0] == '#') {
                continue;
            }

            // Find = separator
            size_t pos = line.find('=');
            if (pos == std::string::npos) {
                continue;
            }

            // Extract key and value
            std::string key = line.substr(0, pos);
            std::string value = line.substr(pos + 1);

            // Trim whitespace
            key.erase(0, key.find_first_not_of(" \t"));
            key.erase(key.find_last_not_of(" \t") + 1);
            value.erase(0, value.find_first_not_of(" \t"));
            value.erase(value.find_last_not_of(" \t") + 1);

            // Remove quotes from value if present
            if (value.size() >= 2 &&
                ((value.front() == '"' && value.back() == '"') ||
                 (value.front() == '\'' && value.back() == '\''))) {
                value = value.substr(1, value.size() - 2);
            }

            // Set environment variable
            setenv(key.c_str(), value.c_str(), 0); // Don't overwrite existing
            count++;
        }

        spdlog::info("Loaded {} environment variables from {}", count, path);
        return true;
    }

    // Load .env file from multiple possible locations
    static bool loadEnvFileAuto() {
        // Try current directory first
        if (loadEnvFile(".env")) {
            return true;
        }

        // Try /app/.env (Docker convention)
        if (loadEnvFile("/app/.env")) {
            return true;
        }

        // Try /etc/dbal/.env (system-wide)
        if (loadEnvFile("/etc/dbal/.env")) {
            return true;
        }

        spdlog::debug("No .env file found, using environment variables only");
        return false;
    }
};

} // namespace config
} // namespace dbal

#endif // DBAL_CONFIG_LOADER_HPP
