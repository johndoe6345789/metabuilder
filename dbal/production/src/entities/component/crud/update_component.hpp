#ifndef DBAL_UPDATE_COMPONENT_HPP
#define DBAL_UPDATE_COMPONENT_HPP

#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "dbal/errors.hpp"
#include "../helpers.hpp"

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

    if (input.childIds.has_value()) {
        component.childIds = input.childIds.value();
    }

    if (input.parentId.has_value()) {
        const std::string& new_parent = input.parentId.value();
        if (new_parent.empty()) {
            return Error::validationError("parentId cannot be empty");
        }
        if (new_parent == id) {
            return Error::validationError("Component cannot be its own parent");
        }

        auto parent_it = store.components.find(new_parent);
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + new_parent);
        }
        if (parent_it->second.pageId != component.pageId) {
            return Error::validationError("Parent component must belong to the same page");
        }
        if (helpers::hasDescendant(store, id, new_parent)) {
            return Error::validationError("Cannot move component under its descendant");
        }

        if (component.parentId.has_value()) {
            helpers::removeComponentFromParent(store, component.parentId.value(), id);
        }
        component.parentId = new_parent;
        helpers::addComponentToParent(store, new_parent, id);
    }

    return Result<ComponentNode>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
