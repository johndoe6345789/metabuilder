/**
 * @file list_sessions.hpp
 * @brief List sessions with filtering
 */
#ifndef DBAL_LIST_SESSIONS_HPP
#define DBAL_LIST_SESSIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace session {

/**
 * List sessions with filtering and pagination
 */
inline Result<std::vector<Session>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<Session> sessions;
    auto now = std::chrono::system_clock::now();
    
    for (const auto& [id, session] : store.sessions) {
        bool matches = true;
        
        if (options.filter.find("user_id") != options.filter.end()) {
            if (session.user_id != options.filter.at("user_id")) matches = false;
        }
        
        if (options.filter.find("active_only") != options.filter.end()) {
            if (options.filter.at("active_only") == "true" && session.expires_at < now) {
                matches = false;
            }
        }
        
        if (matches) sessions.push_back(session);
    }
    
    std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
        return a.created_at > b.created_at;
    });
    
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(sessions.size()));
    
    if (start < static_cast<int>(sessions.size())) {
        return Result<std::vector<Session>>(std::vector<Session>(sessions.begin() + start, sessions.begin() + end));
    }
    
    return Result<std::vector<Session>>(std::vector<Session>());
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
