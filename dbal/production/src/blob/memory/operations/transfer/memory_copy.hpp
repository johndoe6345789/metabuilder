/**
 * @file memory_copy.hpp
 * @brief Copy blob in memory storage
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
 * @brief Copy blob in memory store
 */
inline Result<BlobMetadata> memory_copy(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& source_key,
    const std::string& dest_key
) {
    std::lock_guard<std::mutex> lock(mutex);

    auto it = store.find(source_key);
    if (it == store.end()) {
        return Error::notFound("Source blob not found: " + source_key);
    }

    store[dest_key] = it->second;
    store[dest_key].last_modified = std::chrono::system_clock::now();

    return make_blob_metadata(dest_key, store[dest_key]);
}

} // namespace blob
} // namespace dbal
