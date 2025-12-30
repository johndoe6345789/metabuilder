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
                                                 const std::optional<std::string>& parent_id,
                                                 const std::string& page_id) {
    std::vector<std::string> ids;
    if (parent_id.has_value()) {
        auto it = store.components_by_parent.find(parent_id.value());
        if (it != store.components_by_parent.end()) {
            ids = it->second;
        }
    } else {
        for (const auto& [id, component] : store.components) {
            if (component.page_id == page_id && !component.parent_id.has_value()) {
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
                      const std::string& page_id,
                      const std::optional<std::string>& parent_id,
                      std::vector<ComponentHierarchy>& out) {
    auto children = collectChildren(store, parent_id, page_id);
    for (const auto& child_id : children) {
        const auto& component = store.components.at(child_id);
        out.push_back(component);
        buildTree(store, page_id, child_id, out);
    }
}

} // namespace detail

inline Result<std::vector<ComponentHierarchy>> getTree(InMemoryStore& store, const std::string& page_id) {
    if (page_id.empty()) {
        return Error::validationError("pageId is required");
    }
    if (store.pages.find(page_id) == store.pages.end()) {
        return Error::notFound("Page not found: " + page_id);
    }

    std::vector<ComponentHierarchy> tree;
    detail::buildTree(store, page_id, std::nullopt, tree);
    return Result<std::vector<ComponentHierarchy>>(tree);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
