#ifndef DBAL_SERVER_HELPERS_SERIALIZATION_HPP
#define DBAL_SERVER_HELPERS_SERIALIZATION_HPP

#include <json/json.h>
#include <vector>

#include "dbal/core/types.hpp"

namespace dbal {
namespace daemon {

long long timestamp_to_epoch_ms(const Timestamp& timestamp);
::Json::Value user_to_json(const User& user);
::Json::Value users_to_json(const std::vector<User>& users);

ListOptions list_options_from_json(const ::Json::Value& json);
::Json::Value list_response_value(const std::vector<User>& users, const ListOptions& options);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_SERIALIZATION_HPP
