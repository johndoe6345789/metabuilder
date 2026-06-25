/**
 * @file memory_delete.hpp
 * @brief Delete blob from memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include "dbal/errors.hpp"
#include "../blob_data.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Delete blob from memory store
 */
inline Result<bool> memory_delete(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& key
) {
    std::lock_guard<std::mutex> lock(mutex);

    auto it = store.find(key);
    if (it == store.end()) {
        return Error::notFound("Blob not found: " + key);
    }

    store.erase(it);
    return Result<bool>(true);
}

} // namespace blob
} // namespace dbal
