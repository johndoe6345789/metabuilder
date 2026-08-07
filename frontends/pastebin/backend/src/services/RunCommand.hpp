#pragma once

#include "RunFiles.hpp"
#include "RunnerRegistry.hpp"

#include <optional>
#include <string>
#include <vector>

namespace pastebin {

/// Base64-encodes files into a single FILES_PAYLOAD env entry the
/// container-side shell snippet (see fileWriterShellSnippet()) decodes.
std::string makeContainerFilesEnv(const std::vector<SourceFile>& files);

/// The POSIX shell snippet (awk-based, no python3 dependency) that
/// decodes FILES_PAYLOAD and writes files to /workspace.
const char* fileWriterShellSnippet();

/// The timeout (seconds) a non-interactive run will actually enforce:
/// `userTimeoutSeconds` if given, else the runner's own default, always
/// clamped to MAX_RUN_TIMEOUT. Callers use this both to build the
/// command (see below) and to size the Docker wait() grace period, so
/// the two stay in sync.
int effectiveTimeoutSeconds(const RunnerSpec& spec,
                             std::optional<int> userTimeoutSeconds);

/// Builds the container command for `spec`/`entry`. Non-interactive runs
/// are wrapped in the `timeout` coreutil so the container self-terminates
/// (see DockerEngine.hpp's note on exit code 124).
std::vector<std::string> buildRunCommand(
    const RunnerSpec& spec, const std::string& entry, bool interactive,
    std::optional<int> userTimeoutSeconds);

} // namespace pastebin
