#pragma once

#include <optional>
#include <string>

namespace pastebin {

struct RunnerSpec {
    std::string imageEnvVar;
    std::string imageDefault;
    bool interactive = false;
    std::string setupTpl;      // may be empty
    std::string runTpl;        // contains a "{entry}" placeholder
    std::string defaultEntry;
    std::string dockerfilePath; // only cpp-cmake builds its own image
    std::string sqlRunner;      // "sqlite"/"mysql"/"postgres", else empty
};

/// Builds a non-SQL RunnerSpec.
RunnerSpec makeRunnerSpec(std::string imageEnvVar, std::string imageDefault,
                           bool interactive, std::string setupTpl,
                           std::string runTpl, std::string defaultEntry,
                           std::string dockerfilePath = "");

/// Builds a SQL RunnerSpec (spins up a fresh DB container per run instead
/// of the file-injection scaffolding the other runners use).
RunnerSpec makeSqlRunnerSpec(std::string imageEnvVar,
                              std::string imageDefault,
                              std::string sqlRunner,
                              std::string defaultEntry);

std::optional<RunnerSpec> findRunner(const std::string& language);
std::string runnerImage(const RunnerSpec& spec);

} // namespace pastebin
