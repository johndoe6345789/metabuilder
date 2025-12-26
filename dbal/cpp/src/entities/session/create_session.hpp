/**
 * @file create_session.hpp
 * @brief Create session operation
 */
#ifndef DBAL_CREATE_SESSION_HPP
#define DBAL_CREATE_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Create a new session in the store
 */
inline Result<Session> create(InMemoryStore& store, const CreateSessionInput& input) {
    if (input.user_id.empty()) {
        return Error::validationError("User ID is required");
    }
    if (store.users.find(input.user_id) == store.users.end()) {
        return Error::notFound("User not found: " + input.user_id);
    }
    if (input.ttl_seconds <= 0) {
        return Error::validationError("TTL must be positive");
    }
    
    Session session;
    session.id = store.generateId("session", ++store.session_counter);
    session.user_id = input.user_id;
    session.token = store.generateToken();
    session.expires_at = std::chrono::system_clock::now() + std::chrono::seconds(input.ttl_seconds);
    session.ip_address = input.ip_address;
    session.user_agent = input.user_agent;
    session.created_at = std::chrono::system_clock::now();
    
    store.sessions[session.id] = session;
    store.session_tokens[session.token] = session.id;
    
    return Result<Session>(session);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
