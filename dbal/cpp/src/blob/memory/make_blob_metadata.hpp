/**
 * @file make_blob_metadata.hpp
 * @brief Create blob metadata from blob data
 */

#pragma once

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "blob_data.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Create BlobMetadata from BlobData
 * @param key The blob key
 * @param blob The blob data
 * @return Result containing metadata
 */
inline Result<BlobMetadata> make_blob_metadata(const std::string& key, const BlobData& blob) {
    BlobMetadata meta;
    meta.key = key;
    meta.size = blob.data.size();
    meta.content_type = blob.content_type;
    meta.etag = blob.etag;
    meta.last_modified = blob.last_modified;
    meta.custom_metadata = blob.metadata;
    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
