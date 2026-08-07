#include "InteractiveSession.hpp"
#include "LineSplitter.hpp"
#include "PromptSentinel.hpp"
#include "StreamingDemux.hpp"

#include <array>
#include <unistd.h>

namespace pastebin {

void InteractiveSession::dispatchLine(int streamType,
                                       const std::string& line) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (streamType == 2) {
        output_.push_back({"err", line + "\n"});
        return;
    }
    if (const auto prompt = matchPromptLine(line)) {
        if (!prompt->empty())
            output_.push_back({"prompt", *prompt});
        waitingForInput_ = true;
        return;
    }
    output_.push_back({"out", line + "\n"});
}

void InteractiveSession::readLoop() {
    StreamingDemux demux;
    LineSplitter outLines;
    LineSplitter errLines;

    std::array<char, 4096> chunk{};
    while (true) {
        const ssize_t n = ::read(fd_, chunk.data(), chunk.size());
        if (n <= 0)
            break;
        const std::string bytes(chunk.data(), static_cast<size_t>(n));
        for (const auto& frame : demux.feed(bytes)) {
            auto& splitter = frame.streamType == 2 ? errLines : outLines;
            for (const auto& line : splitter.feed(frame.payload))
                dispatchLine(frame.streamType, line);
        }
    }
    if (const auto rest = outLines.flush())
        dispatchLine(1, *rest);
    if (const auto rest = errLines.flush())
        dispatchLine(2, *rest);

    done_ = true;
    ::close(fd_);
    kill();
}

} // namespace pastebin
