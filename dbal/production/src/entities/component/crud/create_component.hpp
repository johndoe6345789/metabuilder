#ifndef DBAL_CREATE_COMPONENT_HPP
#define DBAL_CREATE_COMPONENT_HPP

#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "dbal/errors.hpp"
#include "../helpers.hpp"
#include <chrono>

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentNode> create(InMemoryStore& store, const CreateComponentNodeInput& input) {
    if (input.page_id.empty()) {
        return Error::validationError("page_id is required");
    }
    if (!validation::isValidComponentType(input.type)) {
        return Error::validationError("type must be 1-100 characters");
    }
    if (!validation::isValidComponentOrder(input.order)) {
        return Error::validationError("order must be a non-negative integer");
    }

    auto page_it = store.pages.find(input.page_id);
    if (page_it == store.pages.end()) {
        return Error::notFound("Page not found: " + input.page_id);
    }

    if (input.parent_id.has_value()) {
        auto parent_it = store.components.find(input.parent_id.value());
        if (parent_it == store.components.end()) {
            return Error::notFound("Parent component not found: " + input.parent_id.value());
        }
        if (parent_it->second.page_id != input.page_id) {
            return Error::validationError("Parent component must belong to the same page");
        }
    }

    const auto now = std::chrono::system_clock::now();
    ComponentNode component;
    component.id = store.generateId("component", ++store.component_counter);
    component.page_id = input.page_id;
    component.parent_id = input.parent_id;
    component.type = input.type;
    component.child_ids = input.child_ids;
    component.order = input.order;
    component.created_at = now;
    component.updated_at = now;

    store.components[component.id] = component;
    helpers::addComponentToPage(store, component.page_id, component.id);
    if (component.parent_id.has_value()) {
        helpers::addComponentToParent(store, component.parent_id.value(), component.id);
    }

    return Result<ComponentNode>(component);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
