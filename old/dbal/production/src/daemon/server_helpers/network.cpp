#include "network.hpp"

#include <algorithm>

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

} // namespace daemon
} // namespace dbal
