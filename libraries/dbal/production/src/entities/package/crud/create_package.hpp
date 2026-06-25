/**
 * @file create_package.hpp
 * @brief Create package operation
 */
#ifndef DBAL_CREATE_PACKAGE_HPP
#define DBAL_CREATE_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/package_validation.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Create a new package in the store
 */
inline Result<InstalledPackage> create(InMemoryStore& store, const CreatePackageInput& input) {
    if (!validation::isValidPackageId(input.packageId)) {
        return Error::validationError("Package ID must be 1-255 characters");
    }
    if (!validation::isValidSemver(input.version)) {
        return Error::validationError("Version must be valid semver");
    }
    std::string key = validation::packageKey(input.packageId);
    if (store.package_keys.find(key) != store.package_keys.end()) {
        return Error::conflict("Package ID already exists: " + key);
    }

    InstalledPackage pkg;
    pkg.packageId = input.packageId;
    pkg.tenantId = input.tenantId;
    pkg.installedAt = input.installedAt.value_or(std::chrono::system_clock::now());
    pkg.version = input.version;
    pkg.enabled = input.enabled;
    pkg.config = input.config;

    store.packages[pkg.packageId] = pkg;
    store.package_keys[key] = pkg.packageId;

    return Result<InstalledPackage>(pkg);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
