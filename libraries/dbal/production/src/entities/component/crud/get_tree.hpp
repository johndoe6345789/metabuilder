#ifndef DBAL_GET_COMPONENT_TREE_HPP
#define DBAL_GET_COMPONENT_TREE_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <optional>
#include <vector>

namespace dbal {
namespace entities {
namespace component {

namespace detail {

inline std::vector<std::string> collectChildren(const InMemoryStore& store,
                                                 const std::optional<std::string>& parentId,
                                                 const std::string& pageId) {
    std::vector<std::string> ids;
    if (parentId.has_value()) {
        auto it = store.components_by_parent.find(parentId.value());
        if (it != store.components_by_parent.end()) {
            ids = it->second;
        }
    } else {
        for (const auto& [id, component] : store.components) {
            if (component.pageId == pageId && !component.parentId.has_value()) {
                ids.push_back(id);
            }
        }
    }

    std::sort(ids.begin(), ids.end(), [&store](const std::string& a, const std::string& b) {
        return store.components.at(a).order < store.components.at(b).order;
    });

    return ids;
}

inline void buildTree(const InMemoryStore& store,
                      const std::string& pageId,
                      const std::optional<std::string>& parentId,
                      std::vector<ComponentNode>& out) {
    auto children = collectChildren(store, parentId, pageId);
    for (const auto& child_id : children) {
        const auto& component = store.components.at(child_id);
        out.push_back(component);
        buildTree(store, pageId, child_id, out);
    }
}

} // namespace detail

inline Result<std::vector<ComponentNode>> getTree(InMemoryStore& store, const std::string& pageId) {
    if (pageId.empty()) {
        return Error::validationError("pageId is required");
    }
    if (store.pages.find(pageId) == store.pages.end()) {
        return Error::notFound("Page not found: " + pageId);
    }

    std::vector<ComponentNode> tree;
    detail::buildTree(store, pageId, std::nullopt, tree);
    return Result<std::vector<ComponentNode>>(tree);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
