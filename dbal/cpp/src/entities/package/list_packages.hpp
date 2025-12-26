/**
 * @file list_packages.hpp
 * @brief List packages with filtering and pagination
 */
#ifndef DBAL_LIST_PACKAGES_HPP
#define DBAL_LIST_PACKAGES_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace package {

/**
 * List packages with filtering and pagination
 */
inline Result<std::vector<Package>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<Package> packages;
    
    for (const auto& [id, pkg] : store.packages) {
        bool matches = true;
        
        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (pkg.is_active != filter_active) matches = false;
        }
        
        if (matches) packages.push_back(pkg);
    }
    
    if (options.sort.find("name") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const Package& a, const Package& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const Package& a, const Package& b) {
            return a.created_at < b.created_at;
        });
    }
    
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(packages.size()));
    
    if (start < static_cast<int>(packages.size())) {
        return Result<std::vector<Package>>(std::vector<Package>(packages.begin() + start, packages.begin() + end));
    }
    
    return Result<std::vector<Package>>(std::vector<Package>());
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
