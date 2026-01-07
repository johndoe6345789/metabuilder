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

    if (input.tenant_id.has_value()) {
        package.tenant_id = input.tenant_id.value();
    }

    if (input.installed_at.has_value()) {
        package.installed_at = input.installed_at.value();
    }

    if (input.enabled.has_value()) {
        package.enabled = input.enabled.value();
    }

    if (input.config.has_value()) {
        package.config = input.config.value();
    }

    package.updated_at = std::chrono::system_clock::now();

    return Result<InstalledPackage>(package);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
