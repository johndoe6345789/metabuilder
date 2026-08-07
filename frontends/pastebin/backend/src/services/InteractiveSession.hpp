#pragma once

#include "RunFiles.hpp"
#include "RunnerRegistry.hpp"

#include <atomic>
#include <chrono>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

namespace pastebin {

struct SessionOutputEntry {
    std::string type; // "out" | "err" | "prompt" | "input-echo"
    std::string text;
};

/// One running interactive code session: owns a throwaway container and
/// a background thread reading its hijacked attach socket. Mirrors the
/// old Flask InteractiveSession class. Thread-safe -- poll()/sendInput()
/// run on an HTTP handler thread while the reader thread appends output
/// concurrently.
class InteractiveSession {
  public:
    explicit InteractiveSession(std::string sessionId);
    ~InteractiveSession();

    InteractiveSession(const InteractiveSession&) = delete;
    InteractiveSession& operator=(const InteractiveSession&) = delete;

    void start(const RunnerSpec& spec, const std::string& entryPoint,
               const std::vector<SourceFile>& files);

    std::vector<SessionOutputEntry> outputSince(size_t offset) const;
    bool waitingForInput() const;
    bool done() const;
    bool sendInput(const std::string& value);
    void kill() const;

    std::chrono::steady_clock::time_point createdAt() const {
        return createdAt_;
    }

  private:
    void readLoop();
    void dispatchLine(int streamType, const std::string& line);

    std::string sessionId_;
    std::chrono::steady_clock::time_point createdAt_;

    mutable std::mutex mutex_;
    std::vector<SessionOutputEntry> output_;
    std::atomic<bool> waitingForInput_{false};
    std::atomic<bool> done_{false};

    std::string containerId_;
    int fd_ = -1;
    std::thread reader_;
};

} // namespace pastebin
