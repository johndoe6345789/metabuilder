#ifndef DBAL_FIRST_LOGIN_FLAG_HPP
#define DBAL_FIRST_LOGIN_FLAG_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> setFirstLogin(InMemoryStore& store, const std::string& username, bool flag) {
    if (username.empty()) {
        return Error::validationError("username is required");
    }

    for (auto& [id, user] : store.users) {
        if (user.username == username) {
            user.firstLogin = flag;
            return Result<bool>(true);
        }
    }
    return Error::notFound("User not found: " + username);
}

inline Result<bool> getFirstLogin(InMemoryStore& store, const std::string& username) {
    if (username.empty()) {
        return Error::validationError("username is required");
    }

    for (const auto& [id, user] : store.users) {
        if (user.username == username) {
            return Result<bool>(user.firstLogin);
        }
    }
    return Error::notFound("User not found: " + username);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
