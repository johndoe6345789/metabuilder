/**
 * @file clean_expired.hpp
 * @brief Clean expired sessions operation
 */
#ifndef DBAL_CLEAN_EXPIRED_SESSIONS_HPP
#define DBAL_CLEAN_EXPIRED_SESSIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../../store/in_memory_store.hpp"
#include <vector>

namespace dbal {
namespace entities {
namespace session {

/**
 * Clean up expired sessions
 * @returns Number of sessions removed
 */
inline Result<int> cleanExpired(InMemoryStore& store) {
    auto now = std::chrono::system_clock::now();
    std::vector<std::string> expired_ids;

    for (const auto& [id, session] : store.sessions) {
        if (session.expiresAt <= now) {
            expired_ids.push_back(id);
        }
    }

    for (const auto& id : expired_ids) {
        auto it = store.sessions.find(id);
        if (it != store.sessions.end()) {
            store.session_tokens.erase(it->second.token);
            store.sessions.erase(it);
        }
    }

    return Result<int>(static_cast<int>(expired_ids.size()));
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
