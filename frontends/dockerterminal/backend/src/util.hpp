#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace dockerterminal {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);

/// Splits a shell-like command string into argv tokens. Handles single and
/// double quotes (so `sh -c "echo hi there"` stays one token) but not
/// escape sequences within them -- deliberately not a full shlex, just
/// enough for the typical admin-exec commands this endpoint sees. Mirrors
/// Python's `shlex.split()`, which the old Flask handler relied on via
/// docker-py's `exec_run(str)`.
std::vector<std::string> splitCommand(const std::string& command);

/// Formats a running container's age the way the old Flask handler did:
/// "<n>d <n>h", or "<n>h <n>m", or "<n>m" depending on magnitude.
/// `nowEpochSeconds` and `createdEpochSeconds` are Unix timestamps.
std::string formatUptime(int64_t createdEpochSeconds, int64_t nowEpochSeconds);

} // namespace dockerterminal
