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

inline Result<std::vector<ComponentNode>> getChildren(InMemoryStore& store,
                                                          const std::string& parentId,
                                                          const std::optional<std::string>& type_filter = std::nullopt,
                                                          int limit = 0) {
    if (parentId.empty()) {
        return Error::validationError("parentId is required");
    }

    auto parent_it = store.components.find(parentId);
    if (parent_it == store.components.end()) {
        return Error::notFound("Component not found: " + parentId);
    }

    auto children_it = store.components_by_parent.find(parentId);
    if (children_it == store.components_by_parent.end()) {
        return Result<std::vector<ComponentNode>>(std::vector<ComponentNode>());
    }

    std::vector<std::string> childIds = children_it->second;
    std::sort(childIds.begin(), childIds.end(), [&](const std::string& a, const std::string& b) {
        return store.components.at(a).order < store.components.at(b).order;
    });

    std::vector<ComponentNode> children;
    children.reserve(childIds.size());
    for (const auto& child_id : childIds) {
        const auto& component = store.components.at(child_id);
        if (type_filter.has_value() && component.type != type_filter.value()) {
            continue;
        }
        children.push_back(component);
        if (limit > 0 && static_cast<int>(children.size()) >= limit) {
            break;
        }
    }

    return Result<std::vector<ComponentNode>>(children);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
