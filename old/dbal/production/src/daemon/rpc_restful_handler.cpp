#include "rpc_restful_handler.hpp"
#include "rpc_user_actions.hpp"

#include <algorithm>
#include <cctype>
#include <exception>
#include <sstream>

namespace {
bool parse_int(const std::string& value, int& out) {
    try {
        size_t idx = 0;
        int parsed = std::stoi(value, &idx);
        if (idx != value.size()) {
            return false;
        }
        out = parsed;
        return true;
    } catch (const std::exception&) {
        return false;
    }
}
} // namespace

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
    Client& client,
    const RouteInfo& route,
    const std::string& method,
    const ::Json::Value& body,
    const std::map<std::string, std::string>& query,
    ResponseSender send_success,
    ErrorSender send_error
) {
    if (!route.valid) {
        send_error(route.error, 400);
        return;
    }
    
    std::string normalized_entity = toLower(route.entity);
    if (normalized_entity == "users") {
        normalized_entity = "user";
    }

    // Determine operation based on HTTP method and path
    std::string operation;
    
    if (method == "GET") {
        if (route.id.empty()) {
            operation = "list";
        } else {
            operation = "read";
        }
    } else if (method == "POST") {
        if (!route.action.empty()) {
            send_error("Custom actions are not supported yet", 404);
            return;
        }
        if (!route.id.empty()) {
            send_error("POST with a resource ID is not supported; use PUT/PATCH", 400);
            return;
        }
        operation = "create";
    } else if (method == "PUT" || method == "PATCH") {
        if (route.id.empty()) {
            send_error("ID is required for update operations", 400);
            return;
        }
        operation = "update";
    } else if (method == "DELETE") {
        if (route.id.empty()) {
            send_error("ID is required for delete operations", 400);
            return;
        }
        operation = "delete";
    } else {
        send_error("Unsupported HTTP method: " + method, 405);
        return;
    }

    if (!route.action.empty()) {
        send_error("Custom actions are not supported yet", 404);
        return;
    }

    if (normalized_entity != "user") {
        send_error("Unsupported entity: " + route.entity, 400);
        return;
    }

    if (operation == "list") {
        ::Json::Value options(::Json::objectValue);
        ::Json::Value filter(::Json::objectValue);
        ::Json::Value sort(::Json::objectValue);

        bool limit_set = false;
        bool page_set = false;
        bool offset_set = false;
        int limit_value = 0;
        int page_value = 0;
        int offset_value = 0;

        for (const auto& [key, value] : query) {
            if (key == "limit" || key == "take") {
                if (!parse_int(value, limit_value) || limit_value <= 0) {
                    send_error("limit must be a positive integer", 400);
                    return;
                }
                limit_set = true;
            } else if (key == "page") {
                if (!parse_int(value, page_value) || page_value <= 0) {
                    send_error("page must be a positive integer", 400);
                    return;
                }
                page_set = true;
            } else if (key == "skip" || key == "offset") {
                if (!parse_int(value, offset_value) || offset_value < 0) {
                    send_error("offset must be a non-negative integer", 400);
                    return;
                }
                offset_set = true;
            } else if (key.rfind("filter.", 0) == 0) {
                filter[key.substr(7)] = value;
            } else if (key.rfind("where.", 0) == 0) {
                filter[key.substr(6)] = value;
            } else if (key.rfind("sort.", 0) == 0) {
                sort[key.substr(5)] = value;
            } else if (key.rfind("orderBy.", 0) == 0) {
                sort[key.substr(8)] = value;
            }
        }

        if (offset_set && !page_set) {
            int effective_limit = limit_set ? limit_value : 20;
            if (effective_limit <= 0) {
                send_error("limit must be a positive integer", 400);
                return;
            }
            page_value = (offset_value / effective_limit) + 1;
            page_set = true;
        }

        if (limit_set) {
            options["limit"] = limit_value;
        }
        if (page_set) {
            options["page"] = page_value;
        }
        if (!filter.empty()) {
            options["filter"] = filter;
        }
        if (!sort.empty()) {
            options["sort"] = sort;
        }

        rpc::handle_user_list(client, route.tenant, options, send_success, send_error);
        return;
    }

    if (operation == "read") {
        rpc::handle_user_read(client, route.tenant, route.id, send_success, send_error);
        return;
    }

    if (operation == "create") {
        rpc::handle_user_create(client, route.tenant, body, send_success, send_error);
        return;
    }

    if (operation == "update") {
        rpc::handle_user_update(client, route.tenant, route.id, body, send_success, send_error);
        return;
    }

    if (operation == "delete") {
        rpc::handle_user_delete(client, route.tenant, route.id, send_success, send_error);
        return;
    }

    send_error("Unsupported operation: " + operation, 400);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
