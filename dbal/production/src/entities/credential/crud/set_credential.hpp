#ifndef DBAL_SET_CREDENTIAL_HPP
#define DBAL_SET_CREDENTIAL_HPP

#include "dbal/errors.hpp"
#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> set(InMemoryStore& store, const CreateCredentialInput& input) {
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("username must be 3-50 characters (alphanumeric, underscore, hyphen)");
    }
    if (!validation::isValidCredentialPassword(input.passwordHash)) {
        return Error::validationError("passwordHash must be a non-empty string");
    }
    if (!helpers::userExists(store, input.username)) {
        return Error::notFound("User not found: " + input.username);
    }

    auto* existing = helpers::getCredential(store, input.username);
    if (existing) {
        existing->passwordHash = input.passwordHash;
    } else {
        Credential credential;
        credential.username = input.username;
        credential.passwordHash = input.passwordHash;
        store.credentials[input.username] = credential;
    }

    return Result<bool>(true);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
