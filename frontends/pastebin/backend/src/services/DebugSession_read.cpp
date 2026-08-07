#include "DebugSession.hpp"
#include "DapFrame.hpp"

#include <array>
#include <unistd.h>

namespace pastebin {

void DebugSession::readLoop() {
    DapFrameReader reader;
    std::array<char, 4096> chunk{};

    while (true) {
        const ssize_t n = ::read(fd_, chunk.data(), chunk.size());
        if (n <= 0)
            break;

        const std::string bytes(chunk.data(), static_cast<size_t>(n));
        auto messages = reader.feed(bytes);
        if (messages.empty())
            continue;

        std::lock_guard<std::mutex> lock(mutex_);
        for (auto& msg : messages)
            messages_.push_back(std::move(msg));
    }

    done_ = true;
    cleanup();
}

} // namespace pastebin
