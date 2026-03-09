/**
 * @file schema_route_handler.cpp
 * @brief Implementation of schema management handlers
 */

#include "schema_route_handler.hpp"
#include "../rpc_schema_actions.hpp"
#include "../server_helpers/response.hpp"
#include <cstdlib>
#include <drogon/HttpTypes.h>
#include <json/json.h>
#include <sstream>

namespace dbal {
namespace daemon {
namespace handlers {

SchemaRouteHandler::SchemaRouteHandler(
    const std::string& registry_path,
    const std::string& packages_path,
    const std::string& output_path
)
    : registry_path_(registry_path)
    , packages_path_(packages_path)
    , output_path_(output_path) {}

void SchemaRouteHandler::handleSchema(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    auto send_success = [&callback](const ::Json::Value& data) {
        callback(build_json_response(data));
    };

    auto send_error = [&callback](const std::string& message, int status) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = message;
        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(static_cast<drogon::HttpStatusCode>(status));
        callback(response);
    };

    // Handle GET - list/status
    if (request->method() == drogon::HttpMethod::Get) {
        rpc::handle_schema_list(registry_path_, send_success, send_error);
        return;
    }

    // Handle POST - actions
    std::istringstream stream(std::string(request->getBody()));
    ::Json::CharReaderBuilder reader_builder;
    ::Json::Value body;
    JSONCPP_STRING errs;
    if (!::Json::parseFromStream(reader_builder, stream, &body, &errs)) {
        send_error("Invalid JSON payload", 400);
        return;
    }

    const std::string action = body.get("action", "").asString();
    const std::string id = body.get("id", "").asString();

    if (action == "scan") {
        rpc::handle_schema_scan(registry_path_, packages_path_, send_success, send_error);
    } else if (action == "approve") {
        if (id.empty()) {
            send_error("Migration ID required", 400);
            return;
        }
        rpc::handle_schema_approve(registry_path_, id, send_success, send_error);
    } else if (action == "reject") {
        if (id.empty()) {
            send_error("Migration ID required", 400);
            return;
        }
        rpc::handle_schema_reject(registry_path_, id, send_success, send_error);
    } else if (action == "generate") {
        rpc::handle_schema_generate(registry_path_, output_path_, send_success, send_error);
    } else {
        send_error("Unknown action: " + action, 400);
    }
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
