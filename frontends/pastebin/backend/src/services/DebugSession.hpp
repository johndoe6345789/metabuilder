#pragma once

#include "RunFiles.hpp"

#include <atomic>
#include <chrono>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace pastebin {

/// One DAP debug session backed by a throwaway container on its own
/// isolated bridge network. Mirrors the old Flask DebugSession class.
/// Thread-safe -- poll()/send() run on an HTTP handler thread while the
/// reader thread appends messages concurrently.
class DebugSession {
  public:
    explicit DebugSession(std::string sessionId);
    ~DebugSession();

    DebugSession(const DebugSession&) = delete;
    DebugSession& operator=(const DebugSession&) = delete;

    void start(const std::string& language, const std::string& entryPoint,
               const std::vector<SourceFile>& files);

    std::vector<std::string> messagesSince(size_t offset) const;
    bool done() const;
    bool send(const std::string& jsonBody);
    void kill();

    std::chrono::steady_clock::time_point createdAt() const {
        return createdAt_;
    }

  private:
    void readLoop();
    void cleanup();

    std::string sessionId_;
    std::chrono::steady_clock::time_point createdAt_;

    mutable std::mutex mutex_;
    std::vector<std::string> messages_;
    std::atomic<bool> done_{false};

    std::string containerId_;
    std::string networkId_;
    int fd_ = -1;
    std::thread reader_;
    std::mutex cleanupMutex_;
};

} // namespace pastebin
