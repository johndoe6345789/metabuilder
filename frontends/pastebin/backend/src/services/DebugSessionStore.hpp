#pragma once

#include "DebugSession.hpp"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

namespace pastebin {

/// Registry of live debug sessions, keyed by session id -- mirrors the
/// old Flask `_DEBUG_SESSIONS` dict + `_reap_debug_sessions()`.
/// Thread-safe; a process-wide singleton via instance().
class DebugSessionStore {
  public:
    static DebugSessionStore& instance();

    std::shared_ptr<DebugSession> create(const std::string& sessionId);
    std::shared_ptr<DebugSession> get(const std::string& sessionId);

    /// Kills and drops one session, if present. No-op otherwise.
    void remove(const std::string& sessionId);

    /// Drops every session that's finished or older than `ttlSeconds`.
    void reap(int ttlSeconds);

  private:
    std::mutex mutex_;
    std::unordered_map<std::string, std::shared_ptr<DebugSession>> sessions_;
};

} // namespace pastebin
