/**
 * @file memory_exists.hpp
 * @brief Check if blob exists in memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include "dbal/errors.hpp"
#include "blob_data.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Check if blob exists in memory store
 */
inline Result<bool> memory_exists(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& key
) {
    std::lock_guard<std::mutex> lock(mutex);
    return Result<bool>(store.find(key) != store.end());
}

} // namespace blob
} // namespace dbal
