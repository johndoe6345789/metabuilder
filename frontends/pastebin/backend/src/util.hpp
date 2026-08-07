#pragma once

#include <cstdint>
#include <string>

namespace pastebin {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);

/// The DBAL tenant this backend's entities live under (default "pastebin").
std::string dbalTenant();

/// Current UTC time as an ISO-8601 string, matching Python's
/// `datetime.utcnow().isoformat()` (no trailing "Z").
std::string nowIso();

/// Current UTC time as epoch milliseconds, matching Python's
/// `int(time.time() * 1000)`.
int64_t nowEpochMillis();

} // namespace pastebin
