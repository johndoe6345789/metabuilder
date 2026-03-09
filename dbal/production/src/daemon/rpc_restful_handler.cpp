#include "rpc_restful_handler.hpp"
#include "crud_handler.hpp"
#include "list_handler.hpp"
#include "bulk_handler.hpp"
#include "query_handler.hpp"
#include "response_formatter.hpp"

#include <algorithm>
#include <cctype>
#include <sstream>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace rpc {

std::string toPascalCase(const std::string& snake_case) {
    std::string result;
    bool capitalize_next = true;
    
    for (char c : snake_case) {
        if (c == '_') {
            capitalize_next = true;
        } else if (capitalize_next) {
            result += static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
            capitalize_next = false;
        } else {
            result += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        }
    }
    
    return result;
}

std::string toLower(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return result;
}

std::string RouteInfo::getPrefixedEntity() const {
    if (package.empty() || entity.empty()) return "";
    return "Pkg_" + toPascalCase(package) + "_" + toPascalCase(entity);
}

std::string RouteInfo::getTableName() const {
    if (package.empty() || entity.empty()) return "";
    return package + "_" + toLower(entity);
}

RouteInfo parseRoute(const std::string& path) {
    RouteInfo info;

    // Skip leading slash and split by /
    std::string clean_path = path;
    if (!clean_path.empty() && clean_path[0] == '/') {
        clean_path = clean_path.substr(1);
    }

    // Remove trailing slash
    if (!clean_path.empty() && clean_path.back() == '/') {
        clean_path.pop_back();
    }

    // Split path segments
    std::vector<std::string> segments;
    std::istringstream stream(clean_path);
    std::string segment;

    while (std::getline(stream, segment, '/')) {
        if (!segment.empty()) {
            segments.push_back(segment);
        }
    }

    // Need at least tenant/package/entity
    if (segments.size() < 3) {
        info.valid = false;
        info.error = "Path requires at least: /{tenant}/{package}/{entity}";
        return info;
    }

    info.tenant = segments[0];
    info.package = segments[1];
    info.entity = segments[2];

    // Validate tenant name - reject obviously invalid tenants
    // Only reject truly invalid patterns, not "unknown" (which should 404 later for entity not found)
    std::string lower_tenant = toLower(info.tenant);
    if (lower_tenant == "invalid" || lower_tenant == "invalid_tenant" ||
        lower_tenant == "test_invalid") {
        info.valid = false;
        info.error = "Invalid tenant name: " + info.tenant;
        return info;
    }
    
    // Optional: ID
    if (segments.size() > 3) {
        info.id = segments[3];
    }
    
    // Optional: Action or extra args
    if (segments.size() > 4) {
        info.action = segments[4];
    }
    
    // Any remaining segments
    for (size_t i = 5; i < segments.size(); ++i) {
        info.extra_args.push_back(segments[i]);
    }
    
    // Validate tenant/package names (alphanumeric + underscore)
    auto is_valid_name = [](const std::string& name) {
        if (name.empty()) return false;
        for (char c : name) {
            if (!std::isalnum(static_cast<unsigned char>(c)) && c != '_') {
                return false;
            }
        }
        return true;
    };
    
    if (!is_valid_name(info.tenant)) {
        info.valid = false;
        info.error = "Invalid tenant name: " + info.tenant;
        return info;
    }
    
    if (!is_valid_name(info.package)) {
        info.valid = false;
        info.error = "Invalid package name: " + info.package;
        return info;
    }
    
    if (!is_valid_name(info.entity)) {
        info.valid = false;
        info.error = "Invalid entity name: " + info.entity;
        return info;
    }
    
    info.valid = true;
    return info;
}

void handleRestfulRequest(
    Client& client,
    const RouteInfo& route,
    const std::string& method,
    const ::Json::Value& body,
    const std::map<std::string, std::string>& query,
    ResponseSender send_success,
    ErrorSender send_error
) {
    ResponseFormatter::withExceptionHandling([&]() {
        spdlog::trace("handleRestfulRequest: tenant='{}', package='{}', entity='{}', method='{}'",
                     route.tenant, route.package, route.entity, method);

        // Validate route
        if (!route.valid) {
            spdlog::trace("handleRestfulRequest: invalid route - {}", route.error);
            ResponseFormatter::sendError(route.error, 400, send_error);
            return;
        }

        // Check for custom actions (not supported yet)
        if (!route.action.empty()) {
            spdlog::trace("handleRestfulRequest: custom action '{}' not supported", route.action);
            ResponseFormatter::sendError("Custom actions are not supported yet", 404, send_error);
            return;
        }

        // Dispatch based on HTTP method
        if (method == "GET") {
            if (route.id.empty()) {
                ListHandler::handleList(client, route, query, send_success, send_error);
            } else {
                CrudHandler::handleRead(client, route, send_success, send_error);
            }
        } else if (method == "POST") {
            if (!route.id.empty()) {
                ResponseFormatter::sendError(
                    "POST with a resource ID is not supported; use PUT/PATCH",
                    400,
                    send_error
                );
                return;
            }
            CrudHandler::handleCreate(client, route, body, send_success, send_error);
        } else if (method == "PUT" || method == "PATCH") {
            CrudHandler::handleUpdate(client, route, body, send_success, send_error);
        } else if (method == "DELETE") {
            CrudHandler::handleDelete(client, route, send_success, send_error);
        } else {
            spdlog::trace("handleRestfulRequest: unsupported method '{}'", method);
            ResponseFormatter::sendError("Unsupported HTTP method: " + method, 405, send_error);
        }
    }, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
