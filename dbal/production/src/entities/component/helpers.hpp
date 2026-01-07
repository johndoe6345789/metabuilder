#ifndef DBAL_COMPONENT_HELPERS_HPP
#define DBAL_COMPONENT_HELPERS_HPP

#include "../../store/in_memory_store.hpp"
#include <algorithm>
#include <vector>

namespace dbal {
namespace entities {
namespace component {
namespace helpers {

inline void addComponentToPage(InMemoryStore& store, const std::string& pageId, const std::string& component_id) {
    store.components_by_page[pageId].push_back(component_id);
}

inline void removeComponentFromPage(InMemoryStore& store, const std::string& pageId, const std::string& component_id) {
    auto it = store.components_by_page.find(pageId);
    if (it == store.components_by_page.end()) {
        return;
    }
    auto& entries = it->second;
    entries.erase(std::remove(entries.begin(), entries.end(), component_id), entries.end());
    if (entries.empty()) {
        store.components_by_page.erase(it);
    }
}

inline void addComponentToParent(InMemoryStore& store, const std::string& parentId, const std::string& component_id) {
    store.components_by_parent[parentId].push_back(component_id);
}

inline void removeComponentFromParent(InMemoryStore& store, const std::string& parentId, const std::string& component_id) {
    auto it = store.components_by_parent.find(parentId);
    if (it == store.components_by_parent.end()) {
        return;
    }
    auto& entries = it->second;
    entries.erase(std::remove(entries.begin(), entries.end(), component_id), entries.end());
    if (entries.empty()) {
        store.components_by_parent.erase(it);
    }
}

inline bool hasDescendant(const InMemoryStore& store, const std::string& ancestor_id, const std::string& candidate_id) {
    auto it = store.components_by_parent.find(ancestor_id);
    if (it == store.components_by_parent.end()) {
        return false;
    }
    for (const auto& child_id : it->second) {
        if (child_id == candidate_id) {
            return true;
        }
        if (hasDescendant(store, child_id, candidate_id)) {
            return true;
        }
    }
    return false;
}

inline void cascadeDeleteComponent(InMemoryStore& store, const std::string& component_id) {
    auto comp_it = store.components.find(component_id);
    if (comp_it == store.components.end()) {
        return;
    }

    auto children_it = store.components_by_parent.find(component_id);
    if (children_it != store.components_by_parent.end()) {
        auto children = children_it->second;
        for (const auto& child_id : children) {
            cascadeDeleteComponent(store, child_id);
        }
        store.components_by_parent.erase(component_id);
    }

    const auto& component = comp_it->second;
    if (component.parentId.has_value()) {
        removeComponentFromParent(store, component.parentId.value(), component_id);
    }
    removeComponentFromPage(store, component.pageId, component_id);
    store.components.erase(comp_it);
}

} // namespace helpers
} // namespace component
} // namespace entities
} // namespace dbal

#endif
