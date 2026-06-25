#include "query_handler.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace rpc {

void QueryHandler::handleFindFirst(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("QueryHandler::handleFindFirst: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Currently not implemented
        ResponseFormatter::sendError(
            "Query operations are not implemented yet",
            501,
            send_error
        );
    }, send_error);
}

void QueryHandler::handleFindByField(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("QueryHandler::handleFindByField: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Validate required fields
        if (!ResponseFormatter::validateRequiredField(body, "field", send_error)) {
            return;
        }
        if (!ResponseFormatter::validateRequiredField(body, "value", send_error)) {
            return;
        }

        // Currently not implemented
        ResponseFormatter::sendError(
            "Query operations are not implemented yet",
            501,
            send_error
        );
    }, send_error);
}

void QueryHandler::handleUpsert(
    Client& client,
    const RouteInfo& route,
    const ::Json::Value& body,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("QueryHandler::handleUpsert: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Currently not implemented
        ResponseFormatter::sendError(
            "Query operations are not implemented yet",
            501,
            send_error
        );
    }, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
