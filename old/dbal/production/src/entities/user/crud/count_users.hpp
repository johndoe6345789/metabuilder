#ifndef DBAL_COUNT_USERS_HPP
#define DBAL_COUNT_USERS_HPP

#include "../../../store/in_memory_store.hpp"
#include <optional>

namespace dbal {
namespace entities {
namespace user {

inline Result<int> count(InMemoryStore& store, const std::optional<std::string>& role = std::nullopt) {
    int total = 0;
    for (const auto& [id, user] : store.users) {
        (void)id;
        if (!role.has_value() || user.role == role.value()) {
            total++;
        }
    }
    return Result<int>(total);
}

} // namespace user
} // namespace entities
} // namespace dbal

#endif
