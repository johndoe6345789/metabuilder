#include "DapFrame.hpp"

#include <algorithm>
#include <cctype>
#include <optional>

namespace pastebin {

namespace {

std::optional<size_t> parseContentLength(const std::string& headerBlock) {
    size_t start = 0;
    while (start < headerBlock.size()) {
        size_t end = headerBlock.find("\r\n", start);
        if (end == std::string::npos)
            end = headerBlock.size();

        std::string line = headerBlock.substr(start, end - start);
        std::string lower = line;
        std::transform(lower.begin(), lower.end(), lower.begin(),
                        [](unsigned char c) { return std::tolower(c); });
        if (lower.rfind("content-length:", 0) == 0)
            return static_cast<size_t>(
                std::stoul(line.substr(line.find(':') + 1)));

        start = end + 2;
    }
    return std::nullopt;
}

} // namespace

std::string buildDapFrame(const std::string& body) {
    return "Content-Length: " + std::to_string(body.size()) + "\r\n\r\n" +
           body;
}

std::vector<std::string> DapFrameReader::feed(const std::string& chunk) {
    buf_ += chunk;
    std::vector<std::string> messages;

    while (true) {
        const size_t sep = buf_.find("\r\n\r\n");
        if (sep == std::string::npos)
            break;

        const auto contentLength = parseContentLength(buf_.substr(0, sep));
        if (!contentLength) {
            buf_.erase(0, sep + 4);
            continue;
        }

        const size_t bodyStart = sep + 4;
        if (buf_.size() < bodyStart + *contentLength)
            break;

        messages.push_back(buf_.substr(bodyStart, *contentLength));
        buf_.erase(0, bodyStart + *contentLength);
    }
    return messages;
}

} // namespace pastebin
