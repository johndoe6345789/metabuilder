#pragma once

#include <nlohmann/json.hpp>

#include <string>

namespace pastebin {

/// Builds the DAP 'launch'/'attach' arguments the frontend sends in its
/// first request after a debug session starts, one shape per language
/// (matches the old Flask `_DEBUG_RUNNERS[language]['launch']`
/// callables).
nlohmann::json buildDebugLaunchArgs(const std::string& language,
                                     const std::string& entry);

} // namespace pastebin
