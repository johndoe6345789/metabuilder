/**
 * @file update_package.hpp
 * @brief Update package operation
 */
#ifndef DBAL_UPDATE_PACKAGE_HPP
#define DBAL_UPDATE_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/package_validation.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Update an existing package
 */
inline Result<InstalledPackage> update(InMemoryStore& store, const std::string& id, const UpdatePackageInput& input) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    InstalledPackage& package = it->second;

    std::string next_version = input.version.value_or(package.version);
    if (!validation::isValidSemver(next_version)) {
        return Error::validationError("Version must be valid semver");
    }

    package.version = next_version;

    if (input.tenantId.has_value()) {
        package.tenantId = input.tenantId.value();
    }

    if (input.installedAt.has_value()) {
        package.installedAt = input.installedAt.value();
    }

    if (input.enabled.has_value()) {
        package.enabled = input.enabled.value();
    }

    if (input.config.has_value()) {
        package.config = input.config.value();
    }

    return Result<InstalledPackage>(package);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
