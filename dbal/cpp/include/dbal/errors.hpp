#ifndef DBAL_ERRORS_HPP
#define DBAL_ERRORS_HPP

#include <stdexcept>
#include <string>
#include <optional>

namespace dbal {

enum class ErrorCode {
    NotFound = 404,
    Conflict = 409,
    Unauthorized = 401,
    Forbidden = 403,
    ValidationError = 422,
    RateLimitExceeded = 429,
    InternalError = 500,
    Timeout = 504,
    DatabaseError = 503,
    CapabilityNotSupported = 501,
    SandboxViolation = 403,
    MaliciousCodeDetected = 403
};

class Error : public std::runtime_error {
public:
    Error(ErrorCode code, const std::string& message)
        : std::runtime_error(message), code_(code) {}

    ErrorCode code() const { return code_; }

    static Error notFound(const std::string& message = "Resource not found");
    static Error conflict(const std::string& message = "Resource conflict");
    static Error unauthorized(const std::string& message = "Authentication required");
    static Error forbidden(const std::string& message = "Access forbidden");
    static Error validationError(const std::string& message);
    static Error internal(const std::string& message = "Internal server error");
    static Error sandboxViolation(const std::string& message);
    static Error maliciousCode(const std::string& message);

private:
    ErrorCode code_;
};

template<typename T>
class Result {
public:
    Result(T value) : value_(std::move(value)), has_value_(true) {}
    Result(Error error) : error_(std::move(error)), has_value_(false) {}

    bool isOk() const { return has_value_; }
    bool isError() const { return !has_value_; }

    T& value() {
        if (!has_value_) throw error_;
        return value_;
    }

    const T& value() const {
        if (!has_value_) throw error_;
        return value_;
    }

    Error& error() {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

    const Error& error() const {
        if (has_value_) throw std::logic_error("No error present");
        return error_;
    }

private:
    T value_;
    Error error_{ErrorCode::InternalError, ""};
    bool has_value_;
};

}

#endif
