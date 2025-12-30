#ifndef DBAL_MOVE_COMPONENT_HPP
#define DBAL_MOVE_COMPONENT_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"
#include <chrono>

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentHierarchy> move(InMemoryStore& store, const MoveComponentInput& input) {
    if (input.id.empty()) {
        return Error::validationError("Component ID is required");
    }
    if (input.order < 0) {
        return Error::validationError("Order must be a non-negative integer");
    }

    auto it = store.components.find(input.id);
    if (it == store.components.end()) {
        return Error::notFound("Component not found: " + input.id);
    }

    ComponentHierarchy& component = it->second;
    const std::string& new_parent = input.new_parent_id;
    if (new_parent == component.id) {
        return Error::validationError("Component cannot be its own parent");
    }

    if (!new_parent.empty()) {
        auto parent_it = store.components.find(new_parent);
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + new_parent);
        }
        if (parent_it->second.page_id != component.page_id) {
            return Error::validationError("New parent must belong to the same page");
        }
        if (helpers::hasDescendant(store, component.id, new_parent)) {
            return Error::validationError("Cannot move component under its descendant");
        }
    }

    if (component.parent_id.has_value()) {
        helpers::removeComponentFromParent(store, component.parent_id.value(), component.id);
    }

    if (!new_parent.empty()) {
        helpers::addComponentToParent(store, new_parent, component.id);
        component.parent_id = new_parent;
    } else {
        component.parent_id = std::nullopt;
    }

    component.order = input.order;
    component.updated_at = std::chrono::system_clock::now();
    return Result<ComponentHierarchy>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
