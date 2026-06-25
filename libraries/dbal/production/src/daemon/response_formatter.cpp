#include "response_formatter.hpp"
#include <exception>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace rpc {

void ResponseFormatter::sendSuccess(const ::Json::Value& data, ResponseSender sender) {
    sender(data);
}

void ResponseFormatter::sendError(
    const std::string& message,
    int status_code,
    ErrorSender sender
) {
    spdlog::trace("ResponseFormatter::sendError: {} (status {})", message, status_code);
    sender(message, status_code);
}

bool ResponseFormatter::withExceptionHandling(
    std::function<void()> func,
    ErrorSender send_error
) {
    try {
        func();
        return true;
    } catch (const std::exception& e) {
        spdlog::error("Response formatting error: {}", e.what());
        sendError(std::string("Internal server error: ") + e.what(), 500, send_error);
        return false;
    }
}

bool ResponseFormatter::validateRequiredField(
    const ::Json::Value& body,
    const std::string& field,
    ErrorSender send_error
) {
    if (!body.isMember(field)) {
        sendError("Missing required field: " + field, 400, send_error);
        return false;
    }
    return true;
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
