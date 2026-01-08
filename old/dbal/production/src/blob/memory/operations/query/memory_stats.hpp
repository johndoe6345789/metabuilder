/**
 * @file memory_total_size.hpp
 * @brief Get total size of memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include "dbal/errors.hpp"
#include "blob_data.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Get total size of all blobs in memory store
 */
inline Result<size_t> memory_total_size(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex
) {
    std::lock_guard<std::mutex> lock(mutex);

    size_t total = 0;
    for (const auto& [key, blob] : store) {
        total += blob.data.size();
    }

    return Result<size_t>(total);
}

/**
 * @brief Get object count in memory store
 */
inline Result<size_t> memory_object_count(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex
) {
    std::lock_guard<std::mutex> lock(mutex);
    return Result<size_t>(store.size());
}

} // namespace blob
} // namespace dbal
