#ifndef DBAL_ENV_PARSER_HPP
#define DBAL_ENV_PARSER_HPP

#include <string>
#include <cstdlib>
#include <stdexcept>
#include <spdlog/spdlog.h>

namespace dbal {
namespace config {

/**
 * Core environment variable parsing utilities
 * Low-level getters with type conversion and error handling
 */
class EnvParser {
public:
    // Get required environment variable (throws if not set)
    static std::string getRequired(const char* name) {
        const char* value = std::getenv(name);
        if (!value || std::string(value).empty()) {
            spdlog::error("Required environment variable {} not set", name);
            throw std::runtime_error(std::string("Required environment variable not set: ") + name);
        }
        spdlog::debug("Config: {} = {}", name, value);
        return std::string(value);
    }

    // Get optional environment variable with default
    static std::string get(const char* name, const std::string& default_value) {
        const char* value = std::getenv(name);
        if (!value || std::string(value).empty()) {
            spdlog::debug("Config: {} = {} (default)", name, default_value);
            return default_value;
        }
        spdlog::debug("Config: {} = {}", name, value);
        return std::string(value);
    }

    // Get integer environment variable
    static int getInt(const char* name, int default_value) {
        const char* value = std::getenv(name);
        if (!value || std::string(value).empty()) {
            spdlog::debug("Config: {} = {} (default)", name, default_value);
            return default_value;
        }
        try {
            int result = std::stoi(value);
            spdlog::debug("Config: {} = {}", name, result);
            return result;
        } catch (const std::invalid_argument& e) {
            spdlog::warn("Invalid integer value for {}: '{}', using default {} ({})", name, value, default_value, e.what());
            return default_value;
        } catch (const std::out_of_range& e) {
            spdlog::warn("Integer out of range for {}: '{}', using default {} ({})", name, value, default_value, e.what());
            return default_value;
        }
    }

    // Get boolean environment variable
    static bool getBool(const char* name, bool default_value) {
        const char* value = std::getenv(name);
        if (!value || std::string(value).empty()) {
            spdlog::debug("Config: {} = {} (default)", name, default_value);
            return default_value;
        }
        std::string str_value(value);
        // Convert to lowercase for comparison
        for (auto& c : str_value) c = std::tolower(c);

        bool result = (str_value == "true" || str_value == "1" || str_value == "yes" || str_value == "on");
        spdlog::debug("Config: {} = {}", name, result);
        return result;
    }
};

} // namespace config
} // namespace dbal

#endif // DBAL_ENV_PARSER_HPP
