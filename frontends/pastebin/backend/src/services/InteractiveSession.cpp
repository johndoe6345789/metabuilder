#include "InteractiveSession.hpp"
#include "DockerEngine.hpp"
#include "SocketIo.hpp"

#include <utility>

namespace pastebin {

InteractiveSession::InteractiveSession(std::string sessionId)
    : sessionId_(std::move(sessionId)),
      createdAt_(std::chrono::steady_clock::now()) {}

InteractiveSession::~InteractiveSession() {
    if (reader_.joinable())
        reader_.join();
}

std::vector<SessionOutputEntry>
InteractiveSession::outputSince(size_t offset) const {
    std::lock_guard<std::mutex> lock(mutex_);
    if (offset >= output_.size())
        return {};
    return {output_.begin() + static_cast<long>(offset), output_.end()};
}

bool InteractiveSession::waitingForInput() const { return waitingForInput_; }

bool InteractiveSession::done() const { return done_; }

void InteractiveSession::kill() const {
    if (!containerId_.empty())
        dockerRemoveContainer(containerId_);
}

bool InteractiveSession::sendInput(const std::string& value) {
    if (!waitingForInput_ || fd_ < 0)
        return false;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        output_.push_back({"input-echo", value + "\n"});
    }
    waitingForInput_ = false;
    return sendAll(fd_, value + "\n");
}

} // namespace pastebin
