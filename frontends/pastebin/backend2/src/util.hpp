#pragma once

#include <string>

namespace pastebin {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);

} // namespace pastebin
