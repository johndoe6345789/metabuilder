#ifndef DBAL_SERVER_HELPERS_RESPONSE_HPP
#define DBAL_SERVER_HELPERS_RESPONSE_HPP

#include <json/json.h>

#include <drogon/drogon.h>

namespace dbal {
namespace daemon {

drogon::HttpResponsePtr build_json_response(const ::Json::Value& body);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_RESPONSE_HPP
