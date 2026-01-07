/**
 * @file list_pages.hpp
 * @brief List pages with filtering and pagination
 */
#ifndef DBAL_LIST_PAGES_HPP
#define DBAL_LIST_PAGES_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace page {

/**
 * List pages with filtering and pagination
 */
inline Result<std::vector<PageConfig>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<PageConfig> pages;
    
    for (const auto& [id, page] : store.pages) {
        bool matches = true;
        
        if (options.filter.find("isPublished") != options.filter.end()) {
            bool filter_published = options.filter.at("isPublished") == "true";
            if (page.isPublished != filter_published) matches = false;
        }
        
        if (options.filter.find("level") != options.filter.end()) {
            int filter_level = std::stoi(options.filter.at("level"));
            if (page.level != filter_level) matches = false;
        }
        
        if (matches) pages.push_back(page);
    }
    
    if (options.sort.find("title") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageConfig& a, const PageConfig& b) {
            return a.title < b.title;
        });
    } else if (options.sort.find("createdAt") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageConfig& a, const PageConfig& b) {
            return a.createdAt < b.createdAt;
        });
    }
    
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(pages.size()));
    
    if (start < static_cast<int>(pages.size())) {
        return Result<std::vector<PageConfig>>(std::vector<PageConfig>(pages.begin() + start, pages.begin() + end));
    }
    
    return Result<std::vector<PageConfig>>(std::vector<PageConfig>());
}

} // namespace page
} // namespace entities
} // namespace dbal

#endif
