#ifndef DBAL_CRUD_HANDLER_HPP
#define DBAL_CRUD_HANDLER_HPP

#include "response_formatter.hpp"
#include "rpc_restful_handler.hpp"
#include "dbal/core/client.hpp"
#include <json/json.h>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

/**
 * @brief Handler for CRUD operations (Create, Read, Update, Delete)
 *
 * Handles:
 * - POST /{tenant}/{package}/{entity} - Create new resource
 * - GET /{tenant}/{package}/{entity}/{id} - Read single resource
 * - PUT/PATCH /{tenant}/{package}/{entity}/{id} - Update resource
 * - DELETE /{tenant}/{package}/{entity}/{id} - Delete resource
 */
class CrudHandler {
public:
    /**
     * @brief Handle CREATE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing resource data
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleCreate(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle READ operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleRead(
        Client& client,
        const RouteInfo& route,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle UPDATE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing updated data
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleUpdate(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle DELETE operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleDelete(
        Client& client,
        const RouteInfo& route,
        ResponseSender send_success,
        ErrorSender send_error
    );
};

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_CRUD_HANDLER_HPP
