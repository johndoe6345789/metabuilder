#pragma once

#include "RunFiles.hpp"

#include <json/json.h>

namespace pastebin {

struct ParsedRunRequest {
    std::string language;
    std::vector<SourceFile> files;
    std::string entryPoint;
};

/// Extracts (language, files, entryPoint) from a /api/run request body,
/// supporting both the current {language, files, entryPoint} shape and
/// the legacy {code} shape, and auto-injecting a minimal CMakeLists.txt
/// for cpp-cmake runs that don't provide one.
ParsedRunRequest parseRunRequest(const Json::Value& data);

} // namespace pastebin
