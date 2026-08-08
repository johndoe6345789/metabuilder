#pragma once

#include <string>

namespace email_backend {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);
std::string nowIso();
long long nowEpochMillis();

/// The DBAL tenant this backend's entities live under (default
/// "emailclient").
std::string dbalTenant();

} // namespace email_backend
