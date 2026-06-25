#include "dbal/core/error_formatter.hpp"

namespace dbal {

int ErrorFormatter::toHttpStatus(const Error& error) {
    return toHttpStatus(error.code());
}

int ErrorFormatter::toHttpStatus(ErrorCode code) {
    return static_cast<int>(code);
}

std::string ErrorFormatter::getErrorTypeName(ErrorCode code) {
    switch (code) {
        case ErrorCode::NotFound:
            return "NotFound";
        case ErrorCode::Conflict:
            return "Conflict";
        case ErrorCode::Unauthorized:
            return "Unauthorized";
        case ErrorCode::Forbidden:
            return "Forbidden";
        case ErrorCode::ValidationError:
            return "ValidationError";
        case ErrorCode::RateLimitExceeded:
            return "RateLimitExceeded";
        case ErrorCode::InternalError:
            return "InternalError";
        case ErrorCode::Timeout:
            return "Timeout";
        case ErrorCode::DatabaseError:
            return "DatabaseError";
        case ErrorCode::CapabilityNotSupported:
            return "CapabilityNotSupported";
        case ErrorCode::SandboxViolation:
            return "SandboxViolation";
        case ErrorCode::MaliciousCodeDetected:
            return "MaliciousCodeDetected";
        default:
            return "UnknownError";
    }
}

nlohmann::json ErrorFormatter::toJson(const Error& error, bool includeDetails) {
    nlohmann::json result;
    nlohmann::json errorObj;

    errorObj["code"] = toHttpStatus(error);
    errorObj["type"] = getErrorTypeName(error.code());

    if (includeDetails) {
        errorObj["message"] = error.what();
    }

    result["error"] = errorObj;
    return result;
}

std::string ErrorFormatter::toJsonString(const Error& error, bool pretty,
                                          bool includeDetails) {
    auto json = toJson(error, includeDetails);
    return pretty ? json.dump(2) : json.dump();
}

}
