/**
 * @file get_session.hpp
 * @brief Get session by ID or token operations
 */
#ifndef DBAL_GET_SESSION_HPP
#define DBAL_GET_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Get a session by ID (cleans expired sessions)
 */
inline Result<Session> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    auto now = std::chrono::system_clock::now();
    if (it->second.expiresAt <= now) {
        store.session_tokens.erase(it->second.token);
        store.sessions.erase(it);
        return Error::notFound("Session expired: " + id);
    }

    return Result<Session>(it->second);
}

/**
 * Get a session by token
 */
inline Result<Session> getByToken(InMemoryStore& store, const std::string& token) {
    if (token.empty()) {
        return Error::validationError("Token cannot be empty");
    }

    auto it = store.session_tokens.find(token);
    if (it == store.session_tokens.end()) {
        return Error::notFound("Session not found for token");
    }

    return get(store, it->second);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
