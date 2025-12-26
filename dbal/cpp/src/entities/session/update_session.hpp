/**
 * @file update_session.hpp
 * @brief Update session operation (extend expiry)
 */
#ifndef DBAL_UPDATE_SESSION_HPP
#define DBAL_UPDATE_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Extend a session's expiration time
 */
inline Result<Session> extend(InMemoryStore& store, const std::string& id, int additional_seconds) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }
    if (additional_seconds <= 0) {
        return Error::validationError("Additional seconds must be positive");
    }
    
    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }
    
    Session& session = it->second;
    
    if (session.expires_at < std::chrono::system_clock::now()) {
        return Error::validationError("Cannot extend expired session");
    }
    
    session.expires_at += std::chrono::seconds(additional_seconds);
    
    return Result<Session>(session);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
