/**
 * @file create_package.hpp
 * @brief Create package operation
 */
#ifndef DBAL_CREATE_PACKAGE_HPP
#define DBAL_CREATE_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/package_validation.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Create a new package in the store
 */
inline Result<Package> create(InMemoryStore& store, const CreatePackageInput& input) {
    if (!validation::isValidPackageName(input.name)) {
        return Error::validationError("Package name must be 1-255 characters");
    }
    if (!validation::isValidSemver(input.version)) {
        return Error::validationError("Version must be valid semver");
    }
    if (input.author.empty()) {
        return Error::validationError("author is required");
    }

    std::string key = validation::packageKey(input.name, input.version);
    if (store.package_keys.find(key) != store.package_keys.end()) {
        return Error::conflict("Package name+version already exists: " + key);
    }

    Package pkg;
    pkg.id = store.generateId("package", ++store.package_counter);
    pkg.name = input.name;
    pkg.version = input.version;
    pkg.description = input.description;
    pkg.author = input.author;
    pkg.manifest = input.manifest;
    pkg.is_installed = input.is_installed;
    pkg.installed_at = input.installed_at;
    pkg.installed_by = input.installed_by;
    pkg.created_at = std::chrono::system_clock::now();
    pkg.updated_at = pkg.created_at;

    store.packages[pkg.id] = pkg;
    store.package_keys[key] = pkg.id;

    return Result<Package>(pkg);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
