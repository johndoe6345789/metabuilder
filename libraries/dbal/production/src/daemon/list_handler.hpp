#ifndef DBAL_LIST_HANDLER_HPP
#define DBAL_LIST_HANDLER_HPP

#include "response_formatter.hpp"
#include "rpc_restful_handler.hpp"
#include "dbal/core/client.hpp"
#include <json/json.h>
#include <map>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

/**
 * @brief Handler for LIST operations with pagination and filtering
 *
 * Handles:
 * - GET /{tenant}/{package}/{entity} - List resources
 *
 * Query parameters:
 * - limit/take: Number of records per page (default: 20)
 * - page: Page number (1-indexed)
 * - skip/offset: Number of records to skip
 * - filter.{field}: Filter by field value
 * - where.{field}: Filter by field value (alias)
 * - sort.{field}: Sort by field (asc/desc)
 * - orderBy.{field}: Sort by field (alias)
 */
class ListHandler {
public:
    /**
     * @brief Handle LIST operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param query Query parameters for filtering/pagination
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleList(
        Client& client,
        const RouteInfo& route,
        const std::map<std::string, std::string>& query,
        ResponseSender send_success,
        ErrorSender send_error
    );

private:
    /**
     * @brief Parse query parameters into options JSON
     * @param query Query parameters
     * @param send_error Error callback for validation errors
     * @return Parsed options or null on error
     */
    static ::Json::Value parseQueryParameters(
        const std::map<std::string, std::string>& query,
        ErrorSender send_error
    );

    /**
     * @brief Parse integer value from string
     * @param value String to parse
     * @param out Output parameter for parsed value
     * @return true if parsing succeeded
     */
    static bool parseIntValue(const std::string& value, int& out);
};

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_LIST_HANDLER_HPP
