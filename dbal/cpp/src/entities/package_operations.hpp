/**
 * @file package_operations.hpp
 * @brief Package entity CRUD operations
 * 
 * Single-responsibility module for Package entity operations.
 */
#ifndef DBAL_PACKAGE_OPERATIONS_HPP
#define DBAL_PACKAGE_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "../validation/package_validation.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new package in the store
 */
inline Result<Package> createPackage(InMemoryStore& store, const CreatePackageInput& input) {
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

    Package package;
    package.id = store.generateId("package", ++store.package_counter);
    package.name = input.name;
    package.version = input.version;
    package.description = input.description;
    package.author = input.author;
    package.manifest = input.manifest;
    package.is_installed = input.is_installed;
    package.installed_at = input.installed_at;
    package.installed_by = input.installed_by;
    package.created_at = std::chrono::system_clock::now();
    package.updated_at = package.created_at;

    store.packages[package.id] = package;
    store.package_keys[key] = package.id;

    return Result<Package>(package);
}

/**
 * Get a package by ID
 */
inline Result<Package> getPackage(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    return Result<Package>(it->second);
}

/**
 * Update an existing package
 */
inline Result<Package> updatePackage(InMemoryStore& store, const std::string& id, const UpdatePackageInput& input) {
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

/**
 * Delete a package by ID
 */
inline Result<bool> deletePackage(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto it = store.packages.find(id);
    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    store.package_keys.erase(validation::packageKey(it->second.name, it->second.version));
    store.packages.erase(it);

    return Result<bool>(true);
}

/**
 * List packages with filtering and pagination
 */
inline Result<std::vector<Package>> listPackages(InMemoryStore& store, const ListOptions& options) {
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

/**
 * Batch create multiple packages
 */
inline Result<int> batchCreatePackages(InMemoryStore& store, const std::vector<CreatePackageInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = createPackage(store, input);
        if (result.isError()) {
            // Rollback on error
            for (const auto& id : created_ids) {
                auto it = store.packages.find(id);
                if (it != store.packages.end()) {
                    store.package_keys.erase(validation::packageKey(it->second.name, it->second.version));
                    store.packages.erase(it);
                }
            }
            return result.error();
        }
        created_ids.push_back(result.value().id);
    }

    return Result<int>(static_cast<int>(created_ids.size()));
}

/**
 * Batch update multiple packages
 */
inline Result<int> batchUpdatePackages(InMemoryStore& store, const std::vector<UpdatePackageBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updatePackage(store, item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

/**
 * Batch delete multiple packages
 */
inline Result<int> batchDeletePackages(InMemoryStore& store, const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deletePackage(store, id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
}

} // namespace entities
} // namespace dbal

#endif
