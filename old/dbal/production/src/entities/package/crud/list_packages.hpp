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
inline Result<std::vector<InstalledPackage>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<InstalledPackage> packages;

    for (const auto& [id, package] : store.packages) {
        bool matches = true;

        if (options.filter.find("packageId") != options.filter.end()) {
            if (package.packageId != options.filter.at("packageId")) matches = false;
        }

        if (options.filter.find("version") != options.filter.end()) {
            if (package.version != options.filter.at("version")) matches = false;
        }

        if (options.filter.find("tenantId") != options.filter.end()) {
            if (!package.tenantId.has_value() || package.tenantId.value() != options.filter.at("tenantId")) {
                matches = false;
            }
        }

        if (options.filter.find("enabled") != options.filter.end()) {
            bool filter_enabled = options.filter.at("enabled") == "true";
            if (package.enabled != filter_enabled) matches = false;
        }

        if (matches) {
            packages.push_back(package);
        }
    }

    if (options.sort.find("packageId") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const InstalledPackage& a, const InstalledPackage& b) {
            return a.packageId < b.packageId;
        });
    } else if (options.sort.find("installedAt") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const InstalledPackage& a, const InstalledPackage& b) {
            return a.installedAt < b.installedAt;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(packages.size()));

    if (start < static_cast<int>(packages.size())) {
        return Result<std::vector<InstalledPackage>>(std::vector<InstalledPackage>(packages.begin() + start, packages.begin() + end));
    }

    return Result<std::vector<InstalledPackage>>(std::vector<InstalledPackage>());
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
