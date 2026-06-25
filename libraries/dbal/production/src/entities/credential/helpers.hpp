#ifndef DBAL_CREDENTIAL_HELPERS_HPP
#define DBAL_CREDENTIAL_HELPERS_HPP

#include "../../store/in_memory_store.hpp"
#include <string>

namespace dbal {
namespace entities {
namespace credential {
namespace helpers {

inline bool userExists(const InMemoryStore& store, const std::string& username) {
    for (const auto& [id, user] : store.users) {
        (void)id;
        if (user.username == username) {
            return true;
        }
    }
    return false;
}

inline Credential* getCredential(InMemoryStore& store, const std::string& username) {
    auto it = store.credentials.find(username);
    if (it == store.credentials.end()) {
        return nullptr;
    }
    return &it->second;
}

} // namespace helpers
} // namespace credential
} // namespace entities
} // namespace dbal

#endif
