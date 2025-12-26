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
    if (input.name.empty() || input.name.length() > 100) {
        return Error::validationError("Name must be between 1 and 100 characters");
    }
    if (!validation::isValidPackageId(input.package_id)) {
        return Error::validationError("Invalid package ID format (lowercase, alphanumeric, underscores)");
    }
    if (!validation::isValidVersion(input.version)) {
        return Error::validationError("Invalid version format (semver: x.y.z)");
    }
    
    if (store.package_ids.find(input.package_id) != store.package_ids.end()) {
        return Error::conflict("Package with ID already exists: " + input.package_id);
    }
    
    Package pkg;
    pkg.id = store.generateId("package", ++store.package_counter);
    pkg.package_id = input.package_id;
    pkg.name = input.name;
    pkg.description = input.description;
    pkg.version = input.version;
    pkg.metadata = input.metadata;
    pkg.is_active = input.is_active;
    pkg.created_at = std::chrono::system_clock::now();
    pkg.updated_at = pkg.created_at;
    
    store.packages[pkg.id] = pkg;
    store.package_ids[pkg.package_id] = pkg.id;
    
    return Result<Package>(pkg);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
