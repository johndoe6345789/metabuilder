#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// The NUL-delimited sentinel the injected input() override (see
/// InteractivePreamble.hpp) writes to stdout to signal it's blocking on
/// a prompt -- chosen because it can't collide with normal user output.
std::string promptStart(); // "\x00PROMPT:"
std::string promptEnd();   // "\x00"

/// Returns the prompt text if `line` is wrapped in the sentinel, else
/// nullopt.
std::optional<std::string> matchPromptLine(const std::string& line);

} // namespace pastebin
