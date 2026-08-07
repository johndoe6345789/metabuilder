#include "LineSplitter.hpp"

namespace pastebin {

std::vector<std::string> LineSplitter::feed(const std::string& text) {
    buf_ += text;
    std::vector<std::string> lines;

    size_t pos = 0;
    while ((pos = buf_.find('\n')) != std::string::npos) {
        lines.push_back(buf_.substr(0, pos));
        buf_.erase(0, pos + 1);
    }
    return lines;
}

std::optional<std::string> LineSplitter::flush() {
    if (buf_.empty())
        return std::nullopt;
    std::string remaining = std::move(buf_);
    buf_.clear();
    return remaining;
}

} // namespace pastebin
