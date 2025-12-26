/**
 * @file list_pages.hpp
 * @brief List pages with filtering and pagination
 */
#ifndef DBAL_LIST_PAGES_HPP
#define DBAL_LIST_PAGES_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace page {

/**
 * List pages with filtering and pagination
 */
inline Result<std::vector<PageView>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<PageView> pages;
    
    for (const auto& [id, page] : store.pages) {
        bool matches = true;
        
        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (page.is_active != filter_active) matches = false;
        }
        
        if (options.filter.find("level") != options.filter.end()) {
            int filter_level = std::stoi(options.filter.at("level"));
            if (page.level != filter_level) matches = false;
        }
        
        if (matches) pages.push_back(page);
    }
    
    if (options.sort.find("title") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.title < b.title;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.created_at < b.created_at;
        });
    }
    
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(pages.size()));
    
    if (start < static_cast<int>(pages.size())) {
        return Result<std::vector<PageView>>(std::vector<PageView>(pages.begin() + start, pages.begin() + end));
    }
    
    return Result<std::vector<PageView>>(std::vector<PageView>());
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
