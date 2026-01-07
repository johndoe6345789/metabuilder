#include "serialization.hpp"

#include <chrono>
#include <json/json.h>

namespace dbal {
namespace daemon {

long long timestamp_to_epoch_ms(const Timestamp& timestamp) {
    return std::chrono::duration_cast<std::chrono::milliseconds>(timestamp.time_since_epoch()).count();
}

::Json::Value user_to_json(const User& user) {
    ::Json::Value value(::Json::objectValue);
    value["id"] = user.id;
    value["tenantId"] = user.tenantId.value_or("");
    value["username"] = user.username;
    value["email"] = user.email;
    value["role"] = user.role;
    value["createdAt"] = static_cast<::Json::Int64>(timestamp_to_epoch_ms(user.createdAt));
    if (user.profilePicture.has_value()) {
        value["profilePicture"] = user.profilePicture.value();
    }
    if (user.bio.has_value()) {
        value["bio"] = user.bio.value();
    }
    value["isInstanceOwner"] = user.isInstanceOwner;
    if (user.passwordChangeTimestamp.has_value()) {
        value["passwordChangeTimestamp"] =
            static_cast<::Json::Int64>(timestamp_to_epoch_ms(user.passwordChangeTimestamp.value()));
    }
    value["firstLogin"] = user.firstLogin;
    return value;
}

::Json::Value users_to_json(const std::vector<User>& users) {
    ::Json::Value arr(::Json::arrayValue);
    for (const auto& user : users) {
        arr.append(user_to_json(user));
    }
    return arr;
}

ListOptions list_options_from_json(const ::Json::Value& json) {
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

::Json::Value list_response_value(const std::vector<User>& users, const ListOptions& options) {
    ::Json::Value value(::Json::objectValue);
    value["data"] = users_to_json(users);
    value["total"] = static_cast<::Json::Int64>(users.size());
    value["page"] = options.page;
    value["limit"] = options.limit;
    value["hasMore"] = ::Json::Value(false);
    return value;
}

} // namespace daemon
} // namespace dbal
