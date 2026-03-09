/**
 * @file memory_download.hpp
 * @brief Download blob from memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include <algorithm>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "../../blob_data.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Download blob from memory store
 */
inline Result<std::vector<char>> memory_download(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& key,
    const DownloadOptions& options
) {
    std::lock_guard<std::mutex> lock(mutex);

    auto it = store.find(key);
    if (it == store.end()) {
        return Error::notFound("Blob not found: " + key);
    }

    const auto& data = it->second.data;

    if (options.offset.has_value() || options.length.has_value()) {
        size_t offset = options.offset.value_or(0);
        size_t length = options.length.value_or(data.size() - offset);

        if (offset >= data.size()) {
            return Error::validationError("Offset exceeds blob size");
        }

        length = std::min(length, data.size() - offset);
        return Result<std::vector<char>>(
            std::vector<char>(data.begin() + offset, data.begin() + offset + length)
        );
    }

    return Result<std::vector<char>>(data);
}

} // namespace blob
} // namespace dbal
