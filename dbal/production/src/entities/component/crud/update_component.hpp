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

inline Result<ComponentHierarchy> update(InMemoryStore& store, const std::string& id, const UpdateComponentHierarchyInput& input) {
    if (id.empty()) {
        return Error::validationError("Component ID cannot be empty");
    }

    auto it = store.components.find(id);
    if (it == store.components.end()) {
        return Error::notFound("Component not found: " + id);
    }

    ComponentHierarchy& component = it->second;

    if (input.component_type.has_value()) {
        if (!validation::isValidComponentType(input.component_type.value())) {
            return Error::validationError("component_type must be 1-100 characters");
        }
        component.component_type = input.component_type.value();
    }

    if (input.order.has_value()) {
        if (!validation::isValidComponentOrder(input.order.value())) {
            return Error::validationError("order must be a non-negative integer");
        }
        component.order = input.order.value();
    }

    if (input.props.has_value()) {
        component.props = input.props.value();
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
    return Result<ComponentHierarchy>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
