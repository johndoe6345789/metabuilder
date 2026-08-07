#pragma once

#include "RunCommand.hpp"
#include "RunFiles.hpp"
#include "RunnerRegistry.hpp"

#include <json/json.h>

#include <optional>

namespace pastebin {

struct RunExecResult {
    Json::Value body;
    int status = 200;
};

/// Runs `entry` from `files` in a throwaway container for a non-SQL
/// runner: pulls the image if needed, builds the timeout-wrapped command,
/// and executes it to completion.
RunExecResult runLanguageInDocker(const RunnerSpec& spec,
                                   const std::string& entry,
                                   const std::vector<SourceFile>& files,
                                   std::optional<int> userTimeoutSeconds);

} // namespace pastebin
