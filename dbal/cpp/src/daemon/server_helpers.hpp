#ifndef DBAL_SERVER_HELPERS_HPP
#define DBAL_SERVER_HELPERS_HPP

#include <string>
#include <vector>

#include <drogon/drogon.h>
#include <json/json.h>

#include "dbal/core/types.hpp"

namespace dbal {
namespace daemon {

std::string trim_string(const std::string& value);
std::string resolve_real_ip(const drogon::HttpRequestPtr& request);
std::string resolve_forwarded_proto(const drogon::HttpRequestPtr& request);

UserRole normalize_role(const std::string& role);
std::string role_to_string(UserRole role);

long long timestamp_to_epoch_ms(const Timestamp& timestamp);

Json::Value user_to_json(const User& user);
Json::Value users_to_json(const std::vector<User>& users);

ListOptions list_options_from_json(const Json::Value& json);
Json::Value list_response_value(const std::vector<User>& users, const ListOptions& options);

drogon::HttpResponsePtr build_json_response(const Json::Value& body);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_HPP
