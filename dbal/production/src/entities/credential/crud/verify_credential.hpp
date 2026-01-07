#ifndef DBAL_VERIFY_CREDENTIAL_HPP
#define DBAL_VERIFY_CREDENTIAL_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> verify(InMemoryStore& store, const std::string& username, const std::string& password) {
    if (username.empty() || password.empty()) {
        return Error::validationError("username and password are required");
    }

    auto* credential = helpers::getCredential(store, username);
    if (!credential || credential->passwordHash != password) {
        return Error::unauthorized("Invalid credentials");
    }

    return Result<bool>(true);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
