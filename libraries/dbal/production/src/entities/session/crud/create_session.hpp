/**
 * @file create_session.hpp
 * @brief Create session operation
 */
#ifndef DBAL_CREATE_SESSION_HPP
#define DBAL_CREATE_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Create a new session in the store
 */
inline Result<Session> create(InMemoryStore& store, const CreateSessionInput& input) {
    if (input.userId.empty()) {
        return Error::validationError("userId is required");
    }
    if (input.token.empty()) {
        return Error::validationError("token is required");
    }

    if (store.users.find(input.userId) == store.users.end()) {
        return Error::validationError("User not found: " + input.userId);
    }
    if (store.session_tokens.find(input.token) != store.session_tokens.end()) {
        return Error::conflict("Session token already exists: " + input.token);
    }

    Session session;
    session.id = store.generateId("session", ++store.session_counter);
    session.userId = input.userId;
    session.token = input.token;
    session.expiresAt = input.expiresAt;
    session.createdAt = input.createdAt.value_or(std::chrono::system_clock::now());
    session.lastActivity = input.lastActivity.has_value() ? input.lastActivity : session.createdAt;
    session.ipAddress = input.ipAddress;
    session.userAgent = input.userAgent;

    store.sessions[session.id] = session;
    store.session_tokens[session.token] = session.id;

    return Result<Session>(session);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
