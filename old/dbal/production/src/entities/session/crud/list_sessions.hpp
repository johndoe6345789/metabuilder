/**
 * @file list_sessions.hpp
 * @brief List sessions with filtering and pagination
 */
#ifndef DBAL_LIST_SESSIONS_HPP
#define DBAL_LIST_SESSIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "lifecycle/clean_expired.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace session {

/**
 * List sessions with filtering and pagination
 */
inline Result<std::vector<Session>> list(InMemoryStore& store, const ListOptions& options) {
    cleanExpired(store);

    std::vector<Session> sessions;

    for (const auto& [id, session] : store.sessions) {
        bool matches = true;

        if (options.filter.find("userId") != options.filter.end()) {
            if (session.userId != options.filter.at("userId")) matches = false;
        }

        if (options.filter.find("token") != options.filter.end()) {
            if (session.token != options.filter.at("token")) matches = false;
        }

        if (matches) {
            sessions.push_back(session);
        }
    }

    if (options.sort.find("createdAt") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.createdAt < b.createdAt;
        });
    } else if (options.sort.find("expiresAt") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.expiresAt < b.expiresAt;
        });
    }

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
