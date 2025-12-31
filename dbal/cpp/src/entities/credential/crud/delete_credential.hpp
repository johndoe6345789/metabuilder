#ifndef DBAL_DELETE_CREDENTIAL_HPP
#define DBAL_DELETE_CREDENTIAL_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace credential {

inline Result<bool> remove(InMemoryStore& store, const std::string& username) {
    if (username.empty()) {
        return Error::validationError("username is required");
    }

    auto it = store.credentials.find(username);
    if (it == store.credentials.end()) {
        return Error::notFound("Credential not found: " + username);
    }

    store.credentials.erase(it);
    return Result<bool>(true);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
