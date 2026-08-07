#include "DebugSession.hpp"
#include "DapFrame.hpp"
#include "DockerEngine.hpp"
#include "DockerNetwork.hpp"
#include "SocketIo.hpp"

#include <unistd.h>

#include <utility>

namespace pastebin {

DebugSession::DebugSession(std::string sessionId)
    : sessionId_(std::move(sessionId)),
      createdAt_(std::chrono::steady_clock::now()) {}

DebugSession::~DebugSession() {
    if (reader_.joinable())
        reader_.join();
}

std::vector<std::string> DebugSession::messagesSince(size_t offset) const {
    std::lock_guard<std::mutex> lock(mutex_);
    if (offset >= messages_.size())
        return {};
    return {messages_.begin() + static_cast<long>(offset), messages_.end()};
}

bool DebugSession::done() const { return done_; }

bool DebugSession::send(const std::string& jsonBody) {
    if (done_ || fd_ < 0)
        return false;
    return sendAll(fd_, buildDapFrame(jsonBody));
}

void DebugSession::kill() {
    done_ = true;
    cleanup();
}

void DebugSession::cleanup() {
    std::lock_guard<std::mutex> lock(cleanupMutex_);
    if (fd_ >= 0) {
        ::close(fd_);
        fd_ = -1;
    }
    if (!containerId_.empty()) {
        dockerRemoveContainer(containerId_);
        containerId_.clear();
    }
    if (!networkId_.empty()) {
        // Every endpoint must be disconnected before a network can be
        // removed -- this covers both the debuggee and (if attached)
        // the backend's own container.
        for (const auto& cid : dockerNetworkContainerIds(networkId_))
            dockerDisconnectNetwork(networkId_, cid);
        dockerRemoveNetwork(networkId_);
        networkId_.clear();
    }
}

} // namespace pastebin
