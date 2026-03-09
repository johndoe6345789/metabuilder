/**
 * @file s3_copy.hpp
 * @brief Copy blob within S3-compatible storage
 *
 * Implements Copy Object: PUT /{bucket}/{dest} with
 * x-amz-copy-source: /{bucket}/{source} header.
 *
 * This is a server-side copy; no data is downloaded and re-uploaded.
 */

#pragma once

#include <string>
#include <map>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"
#include "s3_get_metadata.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Copy an S3 object to a new key
 * @param config S3 configuration
 * @param source_key Source object key
 * @param dest_key Destination object key
 * @return Result containing BlobMetadata for the new copy or error
 */
[[nodiscard]] inline Result<BlobMetadata> s3_copy(
    const S3Config& config,
    const std::string& source_key,
    const std::string& dest_key
) {
    // Build the copy source header
    // Format: /{bucket}/{key} (URL-encoded)
    std::string copy_source = "/" + config.bucket + "/" + source_key;

    std::map<std::string, std::string> extra_headers;
    extra_headers["x-amz-copy-source"] = copy_source;

    auto result = s3_http_request(config, "PUT", dest_key, {}, extra_headers);
    if (result.isError()) {
        return Result<BlobMetadata>(result.error());
    }

    const auto& resp = result.value();
    if (!resp.is_success()) {
        return s3_response_to_error(resp, "Copy " + source_key + " to " + dest_key);
    }

    // After copy, get metadata from the new object
    return s3_get_metadata(config, dest_key);
}

} // namespace blob
} // namespace dbal
