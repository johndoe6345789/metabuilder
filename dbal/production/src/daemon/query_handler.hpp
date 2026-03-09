#ifndef DBAL_QUERY_HANDLER_HPP
#define DBAL_QUERY_HANDLER_HPP

#include "response_formatter.hpp"
#include "rpc_restful_handler.hpp"
#include "dbal/core/client.hpp"
#include <json/json.h>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

/**
 * @brief Handler for advanced query operations
 *
 * Handles:
 * - POST /{tenant}/{package}/{entity}/findFirst - Find first matching record
 * - POST /{tenant}/{package}/{entity}/findByField - Find records by field value
 * - POST /{tenant}/{package}/{entity}/upsert - Update or insert record
 *
 * These operations provide more flexible querying beyond basic CRUD.
 */
class QueryHandler {
public:
    /**
     * @brief Handle findFirst operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing query criteria
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleFindFirst(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle findByField operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing field and value
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleFindByField(
        Client& client,
        const RouteInfo& route,
        const ::Json::Value& body,
        ResponseSender send_success,
        ErrorSender send_error
    );

    /**
     * @brief Handle upsert operation
     * @param client DBAL client
     * @param route Parsed route information
     * @param body Request body containing upsert data
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handleUpsert(
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

#endif // DBAL_QUERY_HANDLER_HPP
