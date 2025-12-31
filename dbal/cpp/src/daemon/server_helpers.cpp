#include "server_helpers.hpp"

#include <algorithm>
#include <cctype>
#include <chrono>
#include <json/json.h>

namespace dbal {
namespace daemon {

std::string trim_string(const std::string& value) {
    const auto start = value.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) {
        return "";
    }
    const auto end = value.find_last_not_of(" \t\r\n");
    return value.substr(start, end - start + 1);
}

std::string resolve_real_ip(const drogon::HttpRequestPtr& request) {
    auto real_ip = request->getHeader("X-Real-IP");
    if (!real_ip.empty()) {
        return real_ip;
    }

    auto forwarded_for = request->getHeader("X-Forwarded-For");
    if (!forwarded_for.empty()) {
        const auto comma = forwarded_for.find(',');
        if (comma != std::string::npos) {
            forwarded_for = forwarded_for.substr(0, comma);
        }
        return trim_string(forwarded_for);
    }

    return "";
}

std::string resolve_forwarded_proto(const drogon::HttpRequestPtr& request) {
    auto forwarded_proto = request->getHeader("X-Forwarded-Proto");
    if (!forwarded_proto.empty()) {
        return forwarded_proto;
    }
    return "http";
}

UserRole normalize_role(const std::string& role) {
    std::string value = role;
    std::transform(value.begin(), value.end(), value.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    if (value == "admin") {
        return UserRole::Admin;
    }
    if (value == "god") {
        return UserRole::God;
    }
    if (value == "supergod") {
        return UserRole::SuperGod;
    }
    return UserRole::User;
}

std::string role_to_string(UserRole role) {
    switch (role) {
        case UserRole::Admin:
            return "admin";
        case UserRole::God:
            return "god";
        case UserRole::SuperGod:
            return "supergod";
        default:
            return "user";
    }
}

long long timestamp_to_epoch_ms(const Timestamp& timestamp) {
    return std::chrono::duration_cast<std::chrono::milliseconds>(timestamp.time_since_epoch()).count();
}

Json::Value user_to_json(const User& user) {
    Json::Value value(Json::objectValue);
    value["id"] = user.id;
    value["username"] = user.username;
    value["email"] = user.email;
    value["role"] = role_to_string(user.role);
    value["createdAt"] = static_cast<Json::Int64>(timestamp_to_epoch_ms(user.created_at));
    value["updatedAt"] = static_cast<Json::Int64>(timestamp_to_epoch_ms(user.updated_at));
    return value;
}

Json::Value users_to_json(const std::vector<User>& users) {
    Json::Value arr(Json::arrayValue);
    for (const auto& user : users) {
        arr.append(user_to_json(user));
    }
    return arr;
}

ListOptions list_options_from_json(const Json::Value& json) {
    ListOptions options;
    if (!json.isNull()) {
        if (json.isMember("page") && json["page"].isInt()) {
            options.page = json["page"].asInt();
        }
        if (json.isMember("limit") && json["limit"].isInt()) {
            options.limit = json["limit"].asInt();
        }
        if (json.isMember("filter") && json["filter"].isObject()) {
            for (const auto& key : json["filter"].getMemberNames()) {
                options.filter[key] = json["filter"][key].asString();
            }
        }
        if (json.isMember("sort") && json["sort"].isObject()) {
            for (const auto& key : json["sort"].getMemberNames()) {
                options.sort[key] = json["sort"][key].asString();
            }
        }
    }
    return options;
}

Json::Value list_response_value(const std::vector<User>& users, const ListOptions& options) {
    Json::Value value(Json::objectValue);
    value["data"] = users_to_json(users);
    value["total"] = static_cast<Json::Int64>(users.size());
    value["page"] = options.page;
    value["limit"] = options.limit;
    value["hasMore"] = Json::Value(false);
    return value;
}

drogon::HttpResponsePtr build_json_response(const Json::Value& body) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->addHeader("Server", "DBAL/1.0.0");
    return response;
}

} // namespace daemon
} // namespace dbal
