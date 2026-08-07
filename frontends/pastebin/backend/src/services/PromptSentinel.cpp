#include "PromptSentinel.hpp"

namespace pastebin {

std::string promptStart() { return std::string("\x00PROMPT:", 8); }

std::string promptEnd() { return std::string("\x00", 1); }

std::optional<std::string> matchPromptLine(const std::string& line) {
    const std::string start = promptStart();
    const std::string end = promptEnd();
    if (line.size() < start.size() + end.size())
        return std::nullopt;
    if (line.compare(0, start.size(), start) != 0)
        return std::nullopt;
    if (line.compare(line.size() - end.size(), end.size(), end) != 0)
        return std::nullopt;
    return line.substr(start.size(),
                        line.size() - start.size() - end.size());
}

} // namespace pastebin
