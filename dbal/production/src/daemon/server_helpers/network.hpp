#ifndef DBAL_SERVER_HELPERS_NETWORK_HPP
#define DBAL_SERVER_HELPERS_NETWORK_HPP

#include <string>

#include <drogon/drogon.h>

namespace dbal {
namespace daemon {

std::string trim_string(const std::string& value);
std::string resolve_real_ip(const drogon::HttpRequestPtr& request);
std::string resolve_forwarded_proto(const drogon::HttpRequestPtr& request);

} // namespace daemon
} // namespace dbal

#endif // DBAL_SERVER_HELPERS_NETWORK_HPP
