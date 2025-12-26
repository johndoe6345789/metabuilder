/**
 * @file memory_get_metadata.hpp
 * @brief Get blob metadata from memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "blob_data.hpp"
#include "make_blob_metadata.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Get blob metadata from memory store
 */
inline Result<BlobMetadata> memory_get_metadata(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& key
) {
    std::lock_guard<std::mutex> lock(mutex);

    auto it = store.find(key);
    if (it == store.end()) {
        return Error::notFound("Blob not found: " + key);
    }

    return make_blob_metadata(key, it->second);
}

} // namespace blob
} // namespace dbal
