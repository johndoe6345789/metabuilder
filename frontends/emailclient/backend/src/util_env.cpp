#include "util_env.hpp"

#include <chrono>
#include <cstdlib>
#include <ctime>

namespace email_backend {

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

std::string dbalTenant() { return envOr("DBAL_TENANT_ID", "emailclient"); }

std::string nowIso() {
    const auto t =
        std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    char buf[32];
    std::strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", std::gmtime(&t));
    return buf;
}

long long nowEpochMillis() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::system_clock::now().time_since_epoch())
        .count();
}

} // namespace email_backend
