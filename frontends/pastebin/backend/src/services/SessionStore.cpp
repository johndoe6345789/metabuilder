#include "SessionStore.hpp"

#include <chrono>
#include <utility>

namespace pastebin {

SessionStore& SessionStore::instance() {
    static SessionStore store;
    return store;
}

std::shared_ptr<InteractiveSession>
SessionStore::create(const std::string& sessionId) {
    auto session = std::make_shared<InteractiveSession>(sessionId);
    std::lock_guard<std::mutex> lock(mutex_);
    sessions_[sessionId] = session;
    return session;
}

std::shared_ptr<InteractiveSession>
SessionStore::get(const std::string& sessionId) {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = sessions_.find(sessionId);
    return it == sessions_.end() ? nullptr : it->second;
}

void SessionStore::reap(int ttlSeconds) {
    const auto now = std::chrono::steady_clock::now();
    std::vector<std::shared_ptr<InteractiveSession>> expired;
    {
        std::lock_guard<std::mutex> lock(mutex_);
        for (auto it = sessions_.begin(); it != sessions_.end();) {
            const auto age = std::chrono::duration_cast<std::chrono::seconds>(
                                  now - it->second->createdAt())
                                  .count();
            if (age > ttlSeconds) {
                expired.push_back(std::move(it->second));
                it = sessions_.erase(it);
            } else {
                ++it;
            }
        }
    }
    // Kill/destroy outside the lock -- these can block on a Docker round
    // trip and a reader-thread join, and shouldn't stall other sessions'
    // create()/get() calls while that happens.
    for (const auto& session : expired)
        session->kill();
}

} // namespace pastebin
