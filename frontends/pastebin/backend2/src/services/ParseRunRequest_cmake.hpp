#pragma once

#include "ParseRunRequest.hpp"

namespace pastebin {

/// If `req.language == "cpp-cmake"` and no CMakeLists.txt is present,
/// injects a minimal one targeting the first .cpp/.cc/.cxx file found
/// (or the current entry point), and points entryPoint at the resulting
/// executable name.
void injectCMakeListsIfNeeded(ParsedRunRequest& req);

} // namespace pastebin
