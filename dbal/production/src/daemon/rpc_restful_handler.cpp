#include "rpc_restful_handler.hpp"

#include <algorithm>
#include <cctype>
#include <sstream>

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
    const RouteInfo& route,
    const std::string& method,
    const Json::Value& body,
    const std::map<std::string, std::string>& query,
    ResponseSender send_success,
    ErrorSender send_error
) {
    if (!route.valid) {
        send_error(route.error, 400);
        return;
    }
    
    const std::string prefixed_entity = route.getPrefixedEntity();
    
    // Build response with route info
    Json::Value response;
    response["tenant"] = route.tenant;
    response["package"] = route.package;
    response["entity"] = route.entity;
    response["prefixedEntity"] = prefixed_entity;
    response["tableName"] = route.getTableName();
    
    // Determine operation based on HTTP method and path
    std::string operation;
    
    if (method == "GET") {
        if (route.id.empty()) {
            operation = "list";
        } else if (!route.action.empty()) {
            operation = route.action;  // Custom read action
        } else {
            operation = "read";
        }
    } else if (method == "POST") {
        if (route.id.empty()) {
            operation = "create";
        } else if (!route.action.empty()) {
            operation = route.action;  // Custom action on resource
        } else {
            operation = "create";
        }
    } else if (method == "PUT" || method == "PATCH") {
        operation = "update";
    } else if (method == "DELETE") {
        operation = "delete";
    } else {
        send_error("Unsupported HTTP method: " + method, 405);
        return;
    }
    
    response["operation"] = operation;
    if (!route.id.empty()) {
        response["id"] = route.id;
    }
    if (!route.action.empty()) {
        response["action"] = route.action;
    }
    
    // Add query params
    if (!query.empty()) {
        Json::Value query_json(Json::objectValue);
        for (const auto& [key, value] : query) {
            query_json[key] = value;
        }
        response["query"] = query_json;
    }
    
    // Add body if present
    if (!body.empty()) {
        response["body"] = body;
    }
    
    // Build the DBAL operation structure
    Json::Value dbal_op;
    dbal_op["entity"] = prefixed_entity;
    dbal_op["operation"] = operation;
    dbal_op["tenantId"] = route.tenant;
    
    if (!route.id.empty()) {
        dbal_op["id"] = route.id;
    }
    
    // Parse query params for list operations
    if (operation == "list") {
        Json::Value options(Json::objectValue);
        
        for (const auto& [key, value] : query) {
            if (key == "take" || key == "limit") {
                options["take"] = std::stoi(value);
            } else if (key == "skip" || key == "offset") {
                options["skip"] = std::stoi(value);
            } else if (key.rfind("where.", 0) == 0) {
                // where.field=value
                if (!options.isMember("where")) {
                    options["where"] = Json::Value(Json::objectValue);
                }
                options["where"][key.substr(6)] = value;
            } else if (key.rfind("orderBy.", 0) == 0) {
                // orderBy.field=asc|desc
                if (!options.isMember("orderBy")) {
                    options["orderBy"] = Json::Value(Json::objectValue);
                }
                options["orderBy"][key.substr(8)] = value;
            }
        }
        
        // Always filter by tenant
        if (!options.isMember("where")) {
            options["where"] = Json::Value(Json::objectValue);
        }
        options["where"]["tenantId"] = route.tenant;
        
        dbal_op["options"] = options;
    }
    
    // For create/update, include body as payload
    if (operation == "create" || operation == "update") {
        Json::Value payload = body;
        payload["tenantId"] = route.tenant;  // Enforce tenant
        dbal_op["payload"] = payload;
    }
    
    response["dbalOperation"] = dbal_op;
    
    // TODO: Actually execute the DBAL operation
    // For now, return the parsed operation structure
    response["status"] = "parsed";
    response["note"] = "DBAL execution pending - this shows how the route was parsed";
    
    send_success(response);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
