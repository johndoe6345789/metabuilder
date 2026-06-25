#ifndef DBAL_RESPONSE_FORMATTER_HPP
#define DBAL_RESPONSE_FORMATTER_HPP

#include <functional>
#include <json/json.h>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Utility class for formatting and sending HTTP responses
 *
 * Handles:
 * - Success responses with data
 * - Error responses with status codes
 * - Exception catching and error conversion
 */
class ResponseFormatter {
public:
    /**
     * @brief Send a success response
     * @param data Response data to send
     * @param sender Success callback
     */
    static void sendSuccess(const ::Json::Value& data, ResponseSender sender);

    /**
     * @brief Send an error response
     * @param message Error message
     * @param status_code HTTP status code
     * @param sender Error callback
     */
    static void sendError(const std::string& message, int status_code, ErrorSender sender);

    /**
     * @brief Execute a function and handle exceptions
     * @param func Function to execute
     * @param send_error Error callback
     * @return true if execution succeeded, false if exception occurred
     */
    static bool withExceptionHandling(
        std::function<void()> func,
        ErrorSender send_error
    );

    /**
     * @brief Validate required field in JSON body
     * @param body JSON body to validate
     * @param field Field name to check
     * @param send_error Error callback
     * @return true if field exists, false and sends error if missing
     */
    static bool validateRequiredField(
        const ::Json::Value& body,
        const std::string& field,
        ErrorSender send_error
    );
};

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_RESPONSE_FORMATTER_HPP
