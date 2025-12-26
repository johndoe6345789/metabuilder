/**
 * @file get_package.hpp
 * @brief Get package by ID or package_id operations
 */
#ifndef DBAL_GET_PACKAGE_HPP
#define DBAL_GET_PACKAGE_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace package {

/**
 * Get a package by ID
 */
inline Result<Package> get(InMemoryStore& store, const std::string& id) {
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
 * Get a package by package_id (snake_case identifier)
 */
inline Result<Package> getByPackageId(InMemoryStore& store, const std::string& package_id) {
    if (package_id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }
    
    auto it = store.package_ids.find(package_id);
    if (it == store.package_ids.end()) {
        return Error::notFound("Package not found: " + package_id);
    }
    
    return get(store, it->second);
}

} // namespace package
} // namespace entities
} // namespace dbal

#endif
