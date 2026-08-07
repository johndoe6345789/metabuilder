#pragma once

#include <string>

namespace email_backend {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);
std::string nowIso();

} // namespace email_backend
