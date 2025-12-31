#ifndef DBAL_SET_CREDENTIAL_HPP
#define DBAL_SET_CREDENTIAL_HPP

#include "dbal/errors.hpp"
#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"
#include <chrono>

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> set(InMemoryStore& store, const CreateCredentialInput& input) {
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("username must be 3-50 characters (alphanumeric, underscore, hyphen)");
    }
    if (!validation::isValidCredentialPassword(input.password_hash)) {
        return Error::validationError("passwordHash must be a non-empty string");
    }
    if (!helpers::userExists(store, input.username)) {
        return Error::notFound("User not found: " + input.username);
    }

    const auto now = std::chrono::system_clock::now();
    auto* existing = helpers::getCredential(store, input.username);
    if (existing) {
        existing->password_hash = input.password_hash;
        existing->first_login = input.first_login;
        existing->updated_at = now;
    } else {
        Credential credential;
        credential.id = store.generateId("credential", ++store.credential_counter);
        credential.username = input.username;
        credential.password_hash = input.password_hash;
        credential.first_login = input.first_login;
        credential.created_at = now;
        credential.updated_at = now;
        store.credentials[input.username] = credential;
    }

    return Result<bool>(true);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
