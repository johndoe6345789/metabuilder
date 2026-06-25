#ifndef DBAL_CREATE_COMPONENT_HPP
#define DBAL_CREATE_COMPONENT_HPP

#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "dbal/errors.hpp"
#include "../helpers.hpp"

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentNode> create(InMemoryStore& store, const CreateComponentNodeInput& input) {
    if (input.pageId.empty()) {
        return Error::validationError("pageId is required");
    }
    if (!validation::isValidComponentType(input.type)) {
        return Error::validationError("type must be 1-100 characters");
    }
    if (!validation::isValidComponentOrder(input.order)) {
        return Error::validationError("order must be a non-negative integer");
    }

    auto page_it = store.pages.find(input.pageId);
    if (page_it == store.pages.end()) {
        return Error::notFound("Page not found: " + input.pageId);
    }

    if (input.parentId.has_value()) {
        auto parent_it = store.components.find(input.parentId.value());
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + input.parentId.value());
        }
        if (parent_it->second.pageId != input.pageId) {
            return Error::validationError("Parent component must belong to the same page");
        }
    }

    ComponentNode component;
    component.id = store.generateId("component", ++store.component_counter);
    component.pageId = input.pageId;
    component.parentId = input.parentId;
    component.type = input.type;
    component.childIds = input.childIds;
    component.order = input.order;

    store.components[component.id] = component;
    helpers::addComponentToPage(store, component.pageId, component.id);
    if (component.parentId.has_value()) {
        helpers::addComponentToParent(store, component.parentId.value(), component.id);
    }

    return Result<ComponentNode>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
