#pragma once

#include <optional>
#include <string>

namespace pastebin {

struct DebugRunnerSpec {
    std::string imageEnvVar;
    std::string imageDefault;
    std::string setupCmd;  // may be empty
    std::string dapCmdTpl; // "{port}"/"{entry}" placeholders
};

std::optional<DebugRunnerSpec> findDebugRunner(const std::string& language);
std::string debugRunnerImage(const DebugRunnerSpec& spec);

/// Renders `spec.dapCmdTpl` with `{port}`/`{entry}` substituted.
std::string renderDapCommand(const DebugRunnerSpec& spec, int port,
                              const std::string& entry);

} // namespace pastebin
