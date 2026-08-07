#pragma once

#include "RunFiles.hpp"

#include <string>
#include <vector>

namespace pastebin {

/// Python source injected before interactive user code: overrides
/// input() to emit the PROMPT sentinel (see PromptSentinel.hpp) on
/// stdout, then reads the response from stdin.
const char* interactiveInputPreamble();

/// Returns `files` with the preamble prepended to the entry-point file's
/// content. No-op if `entryPoint` doesn't match any file.
std::vector<SourceFile> injectInteractivePreamble(
    const std::vector<SourceFile>& files, const std::string& entryPoint);

} // namespace pastebin
