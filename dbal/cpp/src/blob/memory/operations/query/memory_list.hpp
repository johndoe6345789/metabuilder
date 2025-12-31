/**
 * @file memory_list.hpp
 * @brief List blobs in memory storage
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
 * @brief List blobs from memory store
 */
inline Result<BlobListResult> memory_list(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const ListOptions& options
) {
    std::lock_guard<std::mutex> lock(mutex);

    BlobListResult result;
    result.is_truncated = false;
    result.next_token = std::nullopt;

    std::string prefix = options.prefix.value_or("");
    
    for (const auto& [key, blob] : store) {
        if (prefix.empty() || key.find(prefix) == 0) {
            if (result.items.size() >= options.max_keys) {
                result.is_truncated = true;
                result.next_token = key;
                break;
            }
            result.items.push_back(make_blob_metadata(key, blob).value());
        }
    }

    return Result<BlobListResult>(result);
}

} // namespace blob
} // namespace dbal
