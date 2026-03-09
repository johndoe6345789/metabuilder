#include "dbal/core/error_logger.hpp"
#include "dbal/core/error_formatter.hpp"
#include <sstream>

namespace dbal {

void ErrorLogger::log(const Error& error, const std::string& operation,
                       const Context& context) {
    auto level = getLogLevel(error.code());
    std::string contextStr = formatContext(context);
    std::string errorType = ErrorFormatter::getErrorTypeName(error.code());

    if (contextStr.empty()) {
        spdlog::log(level, "[{}] {}: {} (code: {})",
                    operation, errorType, error.what(),
                    ErrorFormatter::toHttpStatus(error));
    } else {
        spdlog::log(level, "[{}] {}: {} (code: {}) - Context: {}",
                    operation, errorType, error.what(),
                    ErrorFormatter::toHttpStatus(error), contextStr);
    }
}

void ErrorLogger::log(const Error& error) {
    auto level = getLogLevel(error.code());
    std::string errorType = ErrorFormatter::getErrorTypeName(error.code());

    spdlog::log(level, "{}: {} (code: {})",
                errorType, error.what(),
                ErrorFormatter::toHttpStatus(error));
}

void ErrorLogger::logException(const std::exception& exception,
                                 const std::string& operation,
                                 const Context& context) {
    std::string contextStr = formatContext(context);

    if (contextStr.empty()) {
        spdlog::error("[{}] Exception: {}", operation, exception.what());
    } else {
        spdlog::error("[{}] Exception: {} - Context: {}",
                      operation, exception.what(), contextStr);
    }
}

std::string ErrorLogger::formatContext(const Context& context) {
    if (context.empty()) {
        return "";
    }

    std::ostringstream oss;
    bool first = true;
    for (const auto& [key, value] : context) {
        if (!first) {
            oss << ", ";
        }
        oss << key << "=" << value;
        first = false;
    }
    return oss.str();
}

spdlog::level::level_enum ErrorLogger::getLogLevel(ErrorCode code) {
    switch (code) {
        case ErrorCode::InternalError:
        case ErrorCode::DatabaseError:
        case ErrorCode::MaliciousCodeDetected:
            return spdlog::level::critical;

        case ErrorCode::Timeout:
        case ErrorCode::SandboxViolation:
            return spdlog::level::err;

        case ErrorCode::NotFound:
        case ErrorCode::Conflict:
        case ErrorCode::ValidationError:
        case ErrorCode::RateLimitExceeded:
        case ErrorCode::CapabilityNotSupported:
            return spdlog::level::warn;

        case ErrorCode::Unauthorized:
        case ErrorCode::Forbidden:
            return spdlog::level::warn;

        default:
            return spdlog::level::err;
    }
}

}
