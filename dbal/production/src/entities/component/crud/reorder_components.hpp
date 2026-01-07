#ifndef DBAL_REORDER_COMPONENTS_HPP
#define DBAL_REORDER_COMPONENTS_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"
#include <optional>
#include <vector>

namespace dbal {
namespace entities {
namespace component {

inline Result<bool> reorder(InMemoryStore& store, const std::vector<ComponentOrderUpdate>& updates) {
    if (updates.empty()) {
        return Result<bool>(true);
    }

    std::optional<std::optional<std::string>> parent_scope;
    for (const auto& update : updates) {
        if (update.id.empty()) {
            return Error::validationError("Component ID is required");
        }
        if (update.order < 0) {
            return Error::validationError("Order must be a non-negative integer");
        }

        auto it = store.components.find(update.id);
        if (it == store.components.end()) {
            return Error::notFound("Component not found: " + update.id);
        }

        const auto& current_parent = it->second.parentId;
        if (!parent_scope.has_value()) {
            parent_scope = current_parent;
        } else if (parent_scope.value() != current_parent) {
            return Error::validationError("All components must share the same parent");
        }
    }

    for (const auto& update : updates) {
        auto it = store.components.find(update.id);
        if (it != store.components.end()) {
            it->second.order = update.order;
        }
    }

    return Result<bool>(true);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
