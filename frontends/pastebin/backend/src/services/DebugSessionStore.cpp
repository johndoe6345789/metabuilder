#include "DebugSessionStore.hpp"

#include <chrono>
#include <utility>

namespace pastebin {

DebugSessionStore& DebugSessionStore::instance() {
    static DebugSessionStore store;
    return store;
}

std::shared_ptr<DebugSession>
DebugSessionStore::create(const std::string& sessionId) {
    auto session = std::make_shared<DebugSession>(sessionId);
    std::lock_guard<std::mutex> lock(mutex_);
    sessions_[sessionId] = session;
    return session;
}

std::shared_ptr<DebugSession>
DebugSessionStore::get(const std::string& sessionId) {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = sessions_.find(sessionId);
    return it == sessions_.end() ? nullptr : it->second;
}

void DebugSessionStore::remove(const std::string& sessionId) {
    std::shared_ptr<DebugSession> session;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        const auto it = sessions_.find(sessionId);
        if (it == sessions_.end())
            return;
        session = std::move(it->second);
        sessions_.erase(it);
    }
    session->kill();
}

void DebugSessionStore::reap(int ttlSeconds) {
    const auto now = std::chrono::steady_clock::now();
    std::vector<std::shared_ptr<DebugSession>> expired;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        for (auto it = sessions_.begin(); it != sessions_.end();) {
            const auto age = std::chrono::duration_cast<std::chrono::seconds>(
                                  now - it->second->createdAt())
                                  .count();
            if (it->second->done() || age > ttlSeconds) {
                expired.push_back(std::move(it->second));
                it = sessions_.erase(it);
            } else {
                ++it;
            }
        }
    }
    for (const auto& session : expired)
        session->kill();
}

} // namespace pastebin
