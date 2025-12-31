/**
 * @file delete_session.hpp
 * @brief Delete session operation
 */
#ifndef DBAL_DELETE_SESSION_HPP
#define DBAL_DELETE_SESSION_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace session {

/**
 * Delete a session by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    store.session_tokens.erase(it->second.token);
    store.sessions.erase(it);

    return Result<bool>(true);
}

} // namespace session
} // namespace entities
} // namespace dbal

#endif
