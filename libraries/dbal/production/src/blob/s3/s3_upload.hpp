/**
 * @file s3_upload.hpp
 * @brief Upload blob to S3-compatible storage
 *
 * Implements PUT Object: PUT /{bucket}/{key} with body, Content-Type,
 * and x-amz-meta-* headers for custom metadata.
 */

#pragma once

#include <string>
#include <vector>
#include <map>
#include <chrono>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Upload an object to S3
 * @param config S3 configuration
 * @param key Object key
 * @param data Object data
 * @param options Upload options (content_type, metadata, overwrite)
 * @return Result containing BlobMetadata or error
 */
[[nodiscard]] inline Result<BlobMetadata> s3_upload(
    const S3Config& config,
    const std::string& key,
    const std::vector<char>& data,
    const UploadOptions& options
) {
    // If overwrite is false, check if object exists first
    if (!options.overwrite) {
        auto head_result = s3_http_request(config, "HEAD", key);
        if (head_result.isOk() && head_result.value().is_success()) {
            return Error::conflict("Blob already exists: " + key);
        }
    }

    // Build extra headers
    std::map<std::string, std::string> extra_headers;

    std::string content_type = options.content_type.value_or("application/octet-stream");
    extra_headers["content-type"] = content_type;

    // Add custom metadata as x-amz-meta-* headers
    for (const auto& [meta_key, meta_value] : options.metadata) {
        extra_headers["x-amz-meta-" + meta_key] = meta_value;
    }

    // Convert data to string for HTTP body
    std::string body(data.begin(), data.end());

    auto result = s3_http_request(config, "PUT", key, {}, extra_headers, body);
    if (result.isError()) {
        return Result<BlobMetadata>(result.error());
    }

    const auto& resp = result.value();
    if (!resp.is_success()) {
        return s3_response_to_error(resp, "Upload " + key);
    }

    // Build metadata from response headers
    BlobMetadata meta;
    meta.key = key;
    meta.size = data.size();
    meta.content_type = content_type;
    meta.etag = resp.get_header("ETag");
    meta.last_modified = std::chrono::system_clock::now();
    meta.custom_metadata = options.metadata;

    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
