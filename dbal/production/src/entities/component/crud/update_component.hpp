#ifndef DBAL_UPDATE_COMPONENT_HPP
#define DBAL_UPDATE_COMPONENT_HPP

#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "dbal/errors.hpp"
#include "../helpers.hpp"
#include <chrono>

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentNode> update(InMemoryStore& store, const std::string& id, const UpdateComponentNodeInput& input) {
    if (id.empty()) {
        return Error::validationError("Component ID cannot be empty");
    }

    auto it = store.components.find(id);
    if (it == store.components.end()) {
        return Error::notFound("Component not found: " + id);
    }

    ComponentNode& component = it->second;

    if (input.type.has_value()) {
        if (!validation::isValidComponentType(input.type.value())) {
            return Error::validationError("type must be 1-100 characters");
        }
        component.type = input.type.value();
    }

    if (input.order.has_value()) {
        if (!validation::isValidComponentOrder(input.order.value())) {
            return Error::validationError("order must be a non-negative integer");
        }
        component.order = input.order.value();
    }

    if (input.child_ids.has_value()) {
        component.child_ids = input.child_ids.value();
    }

    if (input.parent_id.has_value()) {
        const std::string& new_parent = input.parent_id.value();
        if (new_parent.empty()) {
            return Error::validationError("parent_id cannot be empty");
        }
        if (new_parent == id) {
            return Error::validationError("Component cannot be its own parent");
        }

        auto parent_it = store.components.find(new_parent);
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + new_parent);
        }
        if (parent_it->second.page_id != component.page_id) {
            return Error::validationError("Parent component must belong to the same page");
        }
        if (helpers::hasDescendant(store, id, new_parent)) {
            return Error::validationError("Cannot move component under its descendant");
        }

        if (component.parent_id.has_value()) {
            helpers::removeComponentFromParent(store, component.parent_id.value(), id);
        }
        component.parent_id = new_parent;
        helpers::addComponentToParent(store, new_parent, id);
    }

    component.updated_at = std::chrono::system_clock::now();
    return Result<ComponentNode>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
