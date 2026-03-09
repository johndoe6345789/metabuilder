/**
 * @file memory_upload.hpp
 * @brief Upload blob to memory storage
 */

#pragma once

#include <map>
#include <mutex>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "../../blob_data.hpp"
#include "../../metadata/generate_etag.hpp"
#include "../../metadata/make_blob_metadata.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Upload blob to memory store
 */
inline Result<BlobMetadata> memory_upload(
    std::map<std::string, BlobData>& store,
    std::mutex& mutex,
    const std::string& key,
    const std::vector<char>& data,
    const UploadOptions& options
) {
    std::lock_guard<std::mutex> lock(mutex);

    if (!options.overwrite && store.find(key) != store.end()) {
        return Error::conflict("Blob already exists: " + key);
    }

    BlobData blob;
    blob.data = data;
    blob.content_type = options.content_type.value_or("application/octet-stream");
    blob.metadata = options.metadata;
    blob.last_modified = std::chrono::system_clock::now();
    blob.etag = generate_etag(data);

    store[key] = blob;

    return make_blob_metadata(key, blob);
}

} // namespace blob
} // namespace dbal
