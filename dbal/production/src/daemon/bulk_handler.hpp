#ifndef DBAL_BULK_HANDLER_HPP
#define DBAL_BULK_HANDLER_HPP

#include "response_formatter.hpp"
#include "rpc_restful_handler.hpp"
#include "dbal/core/client.hpp"
#include <json/json.h>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

/**
 * @brief Handler for bulk operations
 *
 * Handles:
 * - POST /{tenant}/{package}/{entity}/bulk/create - Create multiple resources
 * - POST /{tenant}/{package}/{entity}/bulk/update - Update multiple resources
 * - POST /{tenant}/{package}/{entity}/bulk/delete - Delete multiple resources
 *
 * Note: These operations are typically more efficient than individual CRUD operations
 * when dealing with multiple records.
 */
class BulkHandler {
public:
    /**
     * @brief Handle bulk CREATE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing array of resources
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleBulkCreate(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle bulk UPDATE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing array of updates
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleBulkUpdate(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle bulk DELETE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing array of IDs
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleBulkDelete(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );
};

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_BULK_HANDLER_HPP
