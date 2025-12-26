/**
 * @file update_package.hpp
 * @brief Update package operation
 */
#ifndef DBAL_UPDATE_PACKAGE_HPP
#define DBAL_UPDATE_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/package_validation.hpp"

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
    
    Package& pkg = it->second;
    
    if (input.name.has_value()) {
        if (input.name.value().empty() || input.name.value().length() > 100) {
            return Error::validationError("Name must be between 1 and 100 characters");
        }
        pkg.name = input.name.value();
    }
    
    if (input.version.has_value()) {
        if (!validation::isValidVersion(input.version.value())) {
            return Error::validationError("Invalid version format");
        }
        pkg.version = input.version.value();
    }
    
    if (input.description.has_value()) pkg.description = input.description.value();
    if (input.metadata.has_value()) pkg.metadata = input.metadata.value();
    if (input.is_active.has_value()) pkg.is_active = input.is_active.value();
    
    pkg.updated_at = std::chrono::system_clock::now();
    return Result<Package>(pkg);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
