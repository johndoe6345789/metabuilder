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
inline Result<Package> update(InMemoryStore& store, const std::string& id, const UpdatePackageInput& input) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    Package& package = it->second;

    std::string next_name = input.name.value_or(package.name);
    std::string next_version = input.version.value_or(package.version);

    if (!validation::isValidPackageName(next_name)) {
        return Error::validationError("Package name must be 1-255 characters");
    }
    if (!validation::isValidSemver(next_version)) {
        return Error::validationError("Version must be valid semver");
    }

    std::string current_key = validation::packageKey(package.name, package.version);
    std::string next_key = validation::packageKey(next_name, next_version);

    if (next_key != current_key) {
        auto key_it = store.package_keys.find(next_key);
        if (key_it != store.package_keys.end() && key_it->second != id) {
            return Error::conflict("Package name+version already exists: " + next_key);
        }
        store.package_keys.erase(current_key);
        store.package_keys[next_key] = id;
    }

    package.name = next_name;
    package.version = next_version;

    if (input.description.has_value()) {
        package.description = input.description.value();
    }

    if (input.author.has_value()) {
        if (input.author.value().empty()) {
            return Error::validationError("author is required");
        }
        package.author = input.author.value();
    }

    if (input.manifest.has_value()) {
        package.manifest = input.manifest.value();
    }

    if (input.is_installed.has_value()) {
        package.is_installed = input.is_installed.value();
    }

    if (input.installed_at.has_value()) {
        package.installed_at = input.installed_at.value();
    }

    if (input.installed_by.has_value()) {
        if (input.installed_by.value().empty()) {
            return Error::validationError("installed_by is required");
        }
        package.installed_by = input.installed_by.value();
    }

    package.updated_at = std::chrono::system_clock::now();

    return Result<Package>(package);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
