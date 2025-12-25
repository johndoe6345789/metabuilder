#include "dbal/errors.hpp"

namespace dbal {

Error Error::notFound(const std::string& message) {
    return Error(ErrorCode::NotFound, message);
}

Error Error::conflict(const std::string& message) {
    return Error(ErrorCode::Conflict, message);
}

Error Error::unauthorized(const std::string& message) {
    return Error(ErrorCode::Unauthorized, message);
}

Error Error::forbidden(const std::string& message) {
    return Error(ErrorCode::Forbidden, message);
}

Error Error::validationError(const std::string& message) {
    return Error(ErrorCode::ValidationError, message);
}

Error Error::internal(const std::string& message) {
    return Error(ErrorCode::InternalError, message);
}

Error Error::sandboxViolation(const std::string& message) {
    return Error(ErrorCode::SandboxViolation, message);
}

Error Error::maliciousCode(const std::string& message) {
    return Error(ErrorCode::MaliciousCodeDetected, message);
}

}
