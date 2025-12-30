#ifndef DBAL_GET_COMPONENT_CHILDREN_HPP
#define DBAL_GET_COMPONENT_CHILDREN_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <optional>
#include <vector>

namespace dbal {
namespace entities {
namespace component {

inline Result<std::vector<ComponentHierarchy>> getChildren(InMemoryStore& store,
                                                          const std::string& parent_id,
                                                          const std::optional<std::string>& type_filter = std::nullopt,
                                                          int limit = 0) {
    if (parent_id.empty()) {
        return Error::validationError("parent_id is required");
    }

    auto parent_it = store.components.find(parent_id);
    if (parent_it == store.components.end()) {
        return Error::notFound("Component not found: " + parent_id);
    }

    auto children_it = store.components_by_parent.find(parent_id);
    if (children_it == store.components_by_parent.end()) {
        return Result<std::vector<ComponentHierarchy>>(std::vector<ComponentHierarchy>());
    }

    std::vector<std::string> child_ids = children_it->second;
    std::sort(child_ids.begin(), child_ids.end(), [&](const std::string& a, const std::string& b) {
        return store.components.at(a).order < store.components.at(b).order;
    });

    std::vector<ComponentHierarchy> children;
    children.reserve(child_ids.size());
    for (const auto& child_id : child_ids) {
        const auto& component = store.components.at(child_id);
        if (type_filter.has_value() && component.component_type != type_filter.value()) {
            continue;
        }
        children.push_back(component);
        if (limit > 0 && static_cast<int>(children.size()) >= limit) {
            break;
        }
    }

    return Result<std::vector<ComponentHierarchy>>(children);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
