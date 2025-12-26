/**
 * @file session_operations.hpp
 * @brief Session entity CRUD operations
 * 
 * Single-responsibility module for Session entity operations.
 */
#ifndef DBAL_SESSION_OPERATIONS_HPP
#define DBAL_SESSION_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new session in the store
 */
inline Result<Session> createSession(InMemoryStore& store, const CreateSessionInput& input) {
    if (input.user_id.empty()) {
        return Error::validationError("user_id is required");
    }
    if (input.token.empty()) {
        return Error::validationError("token is required");
    }

    if (store.users.find(input.user_id) == store.users.end()) {
        return Error::validationError("User not found: " + input.user_id);
    }
    if (store.session_tokens.find(input.token) != store.session_tokens.end()) {
        return Error::conflict("Session token already exists: " + input.token);
    }

    Session session;
    session.id = store.generateId("session", ++store.session_counter);
    session.user_id = input.user_id;
    session.token = input.token;
    session.expires_at = input.expires_at;
    session.created_at = std::chrono::system_clock::now();
    session.last_activity = session.created_at;

    store.sessions[session.id] = session;
    store.session_tokens[session.token] = session.id;

    return Result<Session>(session);
}

/**
 * Get a session by ID (cleans expired sessions)
 */
inline Result<Session> getSession(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    auto now = std::chrono::system_clock::now();
    if (it->second.expires_at <= now) {
        store.session_tokens.erase(it->second.token);
        store.sessions.erase(it);
        return Error::notFound("Session expired: " + id);
    }

    return Result<Session>(it->second);
}

/**
 * Update an existing session
 */
inline Result<Session> updateSession(InMemoryStore& store, const std::string& id, const UpdateSessionInput& input) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto it = store.sessions.find(id);
    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    Session& session = it->second;

    if (input.user_id.has_value()) {
        if (input.user_id.value().empty()) {
            return Error::validationError("user_id is required");
        }
        if (store.users.find(input.user_id.value()) == store.users.end()) {
            return Error::validationError("User not found: " + input.user_id.value());
        }
        session.user_id = input.user_id.value();
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

    if (input.expires_at.has_value()) {
        session.expires_at = input.expires_at.value();
    }

    if (input.last_activity.has_value()) {
        session.last_activity = input.last_activity.value();
    }

    return Result<Session>(session);
}

/**
 * Delete a session by ID
 */
inline Result<bool> deleteSession(InMemoryStore& store, const std::string& id) {
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

/**
 * Clean expired sessions from store
 */
inline void cleanExpiredSessions(InMemoryStore& store) {
    auto now = std::chrono::system_clock::now();
    std::vector<std::string> expired_sessions;

    for (const auto& [id, session] : store.sessions) {
        if (session.expires_at <= now) {
            expired_sessions.push_back(id);
        }
    }

    for (const auto& id : expired_sessions) {
        auto expired_it = store.sessions.find(id);
        if (expired_it != store.sessions.end()) {
            store.session_tokens.erase(expired_it->second.token);
            store.sessions.erase(expired_it);
        }
    }
}

/**
 * List sessions with filtering and pagination
 */
inline Result<std::vector<Session>> listSessions(InMemoryStore& store, const ListOptions& options) {
    // Clean expired sessions first
    cleanExpiredSessions(store);
    
    std::vector<Session> sessions;

    for (const auto& [id, session] : store.sessions) {
        bool matches = true;

        if (options.filter.find("user_id") != options.filter.end()) {
            if (session.user_id != options.filter.at("user_id")) matches = false;
        }

        if (options.filter.find("token") != options.filter.end()) {
            if (session.token != options.filter.at("token")) matches = false;
        }

        if (matches) {
            sessions.push_back(session);
        }
    }

    if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.created_at < b.created_at;
        });
    } else if (options.sort.find("expires_at") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.expires_at < b.expires_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(sessions.size()));

    if (start < static_cast<int>(sessions.size())) {
        return Result<std::vector<Session>>(std::vector<Session>(sessions.begin() + start, sessions.begin() + end));
    }

    return Result<std::vector<Session>>(std::vector<Session>());
}

} // namespace entities
} // namespace dbal

#endif
