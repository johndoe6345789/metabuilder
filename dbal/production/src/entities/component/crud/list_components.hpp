#ifndef DBAL_LIST_COMPONENTS_HPP
#define DBAL_LIST_COMPONENTS_HPP

#include "../../../store/in_memory_store.hpp"
#include <algorithm>
#include <string>
#include <vector>

namespace dbal {
namespace entities {
namespace component {

inline Result<std::vector<ComponentNode>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<ComponentNode> components;
    std::string page_filter;

    auto filter_it = options.filter.find("pageId");
    if (filter_it != options.filter.end()) {
        page_filter = filter_it->second;
    }

    for (const auto& [id, component] : store.components) {
        (void)id;
        if (!page_filter.empty() && component.page_id != page_filter) {
            continue;
        }
        if (options.filter.find("parent_id") != options.filter.end()) {
            const std::string& parent_filter = options.filter.at("parent_id");
            if (!component.parent_id.has_value() || component.parent_id.value() != parent_filter) {
                continue;
            }
        }
        if (options.filter.find("type") != options.filter.end()) {
            const std::string& type_filter = options.filter.at("type");
            if (component.type != type_filter) {
                continue;
            }
        }
        components.push_back(component);
    }

    std::sort(components.begin(), components.end(), [](const ComponentNode& a, const ComponentNode& b) {
        if (a.page_id != b.page_id) {
            return a.page_id < b.page_id;
        }
        if (a.parent_id.has_value() != b.parent_id.has_value()) {
            return a.parent_id.has_value() < b.parent_id.has_value();
        }
        if (a.parent_id != b.parent_id) {
            return a.parent_id < b.parent_id;
        }
        if (a.order != b.order) {
            return a.order < b.order;
        }
        return a.id < b.id;
    });

    int page = options.page > 1 ? options.page : 1;
    int limit = options.limit > 0 ? options.limit : static_cast<int>(components.size());
    if (limit <= 0) {
        limit = static_cast<int>(components.size());
    }

    if (limit == 0 || components.empty()) {
        return Result<std::vector<ComponentNode>>(std::vector<ComponentNode>());
    }

    int start = (page - 1) * limit;
    if (start >= static_cast<int>(components.size())) {
        return Result<std::vector<ComponentNode>>(std::vector<ComponentNode>());
    }

    int end = std::min(start + limit, static_cast<int>(components.size()));
    return Result<std::vector<ComponentNode>>(std::vector<ComponentNode>(components.begin() + start,
                                                                                       components.begin() + end));
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
