/**
 * @file list_packages.hpp
 * @brief List packages with filtering and pagination
 */
#ifndef DBAL_LIST_PACKAGES_HPP
#define DBAL_LIST_PACKAGES_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace package {

/**
 * List packages with filtering and pagination
 */
inline Result<std::vector<Package>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<Package> packages;

    for (const auto& [id, package] : store.packages) {
        bool matches = true;

        if (options.filter.find("name") != options.filter.end()) {
            if (package.name != options.filter.at("name")) matches = false;
        }

        if (options.filter.find("version") != options.filter.end()) {
            if (package.version != options.filter.at("version")) matches = false;
        }

        if (options.filter.find("author") != options.filter.end()) {
            if (package.author != options.filter.at("author")) matches = false;
        }

        if (options.filter.find("is_installed") != options.filter.end()) {
            bool filter_installed = options.filter.at("is_installed") == "true";
            if (package.is_installed != filter_installed) matches = false;
        }

        if (matches) {
            packages.push_back(package);
        }
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
