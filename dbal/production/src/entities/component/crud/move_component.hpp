#ifndef DBAL_MOVE_COMPONENT_HPP
#define DBAL_MOVE_COMPONENT_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentNode> move(InMemoryStore& store, const MoveComponentInput& input) {
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

    ComponentNode& component = it->second;
    const std::string& new_parent = input.newParentId;
    if (new_parent == component.id) {
        return Error::validationError("Component cannot be its own parent");
    }

    if (!new_parent.empty()) {
        auto parent_it = store.components.find(new_parent);
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + new_parent);
        }
        if (parent_it->second.pageId != component.pageId) {
            return Error::validationError("New parent must belong to the same page");
        }
        if (helpers::hasDescendant(store, component.id, new_parent)) {
            return Error::validationError("Cannot move component under its descendant");
        }
    }

    if (component.parentId.has_value()) {
        helpers::removeComponentFromParent(store, component.parentId.value(), component.id);
    }

    if (!new_parent.empty()) {
        helpers::addComponentToParent(store, new_parent, component.id);
        component.parentId = new_parent;
    } else {
        component.parentId = std::nullopt;
    }

    component.order = input.order;
    return Result<ComponentNode>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
