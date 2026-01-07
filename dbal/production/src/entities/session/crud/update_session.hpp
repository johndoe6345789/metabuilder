/**
 * @file update_session.hpp
 * @brief Update session operation
 */
#ifndef DBAL_UPDATE_SESSION_HPP
#define DBAL_UPDATE_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Update an existing session
 */
inline Result<Session> update(InMemoryStore& store, const std::string& id, const UpdateSessionInput& input) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    Session& session = it->second;

    if (input.userId.has_value()) {
        if (input.userId.value().empty()) {
            return Error::validationError("userId is required");
        }
        if (store.users.find(input.userId.value()) == store.users.end()) {
            return Error::validationError("User not found: " + input.userId.value());
        }
        session.userId = input.userId.value();
    }

    if (input.token.has_value()) {
        if (input.token.value().empty()) {
            return Error::validationError("token is required");
        }
        auto token_it = store.session_tokens.find(input.token.value());
        if (token_it != store.session_tokens.end() && token_it->second != id) {
            return Error::conflict("Session token already exists: " + input.token.value());
        }
        store.session_tokens.erase(session.token);
        store.session_tokens[input.token.value()] = id;
        session.token = input.token.value();
    }

    if (input.expiresAt.has_value()) {
        session.expiresAt = input.expiresAt.value();
    }

    if (input.lastActivity.has_value()) {
        session.lastActivity = input.lastActivity.value();
    }

    if (input.ipAddress.has_value()) {
        session.ipAddress = input.ipAddress.value();
    }

    if (input.userAgent.has_value()) {
        session.userAgent = input.userAgent.value();
    }

    return Result<Session>(session);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
