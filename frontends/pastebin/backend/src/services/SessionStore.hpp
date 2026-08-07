#pragma once

#include "InteractiveSession.hpp"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

namespace pastebin {

/// Registry of live interactive sessions, keyed by session id -- mirrors
/// the old Flask module-level `_sessions` dict + `_reap_sessions()`.
/// Thread-safe; a process-wide singleton via instance().
class SessionStore {
  public:
    static SessionStore& instance();

    std::shared_ptr<InteractiveSession> create(const std::string& sessionId);
    std::shared_ptr<InteractiveSession> get(const std::string& sessionId);

    /// Kills and drops every session older than `ttlSeconds`.
    void reap(int ttlSeconds);

  private:
    std::mutex mutex_;
    std::unordered_map<std::string, std::shared_ptr<InteractiveSession>>
        sessions_;
};

} // namespace pastebin
