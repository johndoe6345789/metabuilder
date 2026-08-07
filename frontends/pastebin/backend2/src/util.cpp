#include "util.hpp"

#include <chrono>
#include <cstdlib>
#include <ctime>

namespace pastebin {

std::string envOr(const char* name, const std::string& fallback) {
    if (const char* v = std::getenv(name); v && *v)
        return v;
    return fallback;
}

int envInt(const char* name, int fallback) {
    if (const char* v = std::getenv(name); v && *v)
        return std::stoi(v);
    return fallback;
}

std::string dbalTenant() {
    return envOr("DBAL_TENANT_ID", "pastebin");
}

std::string nowIso() {
    const auto now = std::chrono::system_clock::now();
    const auto t = std::chrono::system_clock::to_time_t(now);
    const auto us = std::chrono::duration_cast<std::chrono::microseconds>(
                        now.time_since_epoch()) %
                    1000000;
    char buf[32];
    std::strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%S", std::gmtime(&t));
    char full[40];
    std::snprintf(full, sizeof full, "%s.%06lld", buf,
                  static_cast<long long>(us.count()));
    return full;
}

} // namespace pastebin
