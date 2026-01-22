/**
 * @file logger.hpp
 * @brief Simple logging interface for DBAL
 *
 * Provides a minimal logging interface for security-sensitive operations.
 * Can be replaced with spdlog or other logging library in production.
 */
#ifndef DBAL_LOGGER_HPP
#define DBAL_LOGGER_HPP

#include <chrono>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <mutex>
#include <sstream>
#include <string>

namespace dbal {

/**
 * @brief Log severity levels
 */
enum class LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5
};

/**
 * @brief Simple thread-safe logger for DBAL
 *
 * Provides structured logging for security-sensitive operations
 * such as credential verification and session management.
 */
class Logger {
public:
    static Logger& instance() {
        static Logger logger;
        return logger;
    }

    void setLevel(LogLevel level) {
        level_ = level;
    }

    LogLevel getLevel() const {
        return level_;
    }

    void setOutput(std::ostream& output) {
        output_ = &output;
    }

    void trace(const std::string& component, const std::string& message) {
        log(LogLevel::TRACE, component, message);
    }

    void debug(const std::string& component, const std::string& message) {
        log(LogLevel::DEBUG, component, message);
    }

    void info(const std::string& component, const std::string& message) {
        log(LogLevel::INFO, component, message);
    }

    void warn(const std::string& component, const std::string& message) {
        log(LogLevel::WARN, component, message);
    }

    void error(const std::string& component, const std::string& message) {
        log(LogLevel::ERROR, component, message);
    }

    void fatal(const std::string& component, const std::string& message) {
        log(LogLevel::FATAL, component, message);
    }

    /**
     * @brief Log a security audit event
     * @param action Action performed (e.g., "LOGIN_ATTEMPT", "LOGIN_SUCCESS", "LOGIN_FAILED")
     * @param username Username involved
     * @param details Additional details
     * @param ipAddress Optional IP address
     */
    void audit(const std::string& action,
               const std::string& username,
               const std::string& details = "",
               const std::string& ipAddress = "") {
        std::ostringstream oss;
        oss << "action=" << action
            << ", username=" << username;
        if (!ipAddress.empty()) {
            oss << ", ip=" << ipAddress;
        }
        if (!details.empty()) {
            oss << ", details=" << details;
        }
        log(LogLevel::INFO, "AUDIT", oss.str());
    }

private:
    Logger() : level_(LogLevel::INFO), output_(&std::cerr) {}

    void log(LogLevel level, const std::string& component, const std::string& message) {
        if (level < level_) {
            return;
        }

        std::lock_guard<std::mutex> lock(mutex_);

        const auto now = std::chrono::system_clock::now();
        const auto time = std::chrono::system_clock::to_time_t(now);
        const auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
            now.time_since_epoch()) % 1000;

        *output_ << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S")
                 << '.' << std::setfill('0') << std::setw(3) << ms.count()
                 << " [" << levelString(level) << "] "
                 << "[" << component << "] "
                 << message << std::endl;
    }

    static const char* levelString(LogLevel level) {
        switch (level) {
            case LogLevel::TRACE: return "TRACE";
            case LogLevel::DEBUG: return "DEBUG";
            case LogLevel::INFO:  return "INFO ";
            case LogLevel::WARN:  return "WARN ";
            case LogLevel::ERROR: return "ERROR";
            case LogLevel::FATAL: return "FATAL";
            default: return "?????";
        }
    }

    LogLevel level_;
    std::ostream* output_;
    std::mutex mutex_;
};

/**
 * @brief Convenience function to get the global logger instance
 */
inline Logger& logger() {
    return Logger::instance();
}

} // namespace dbal

#endif // DBAL_LOGGER_HPP
