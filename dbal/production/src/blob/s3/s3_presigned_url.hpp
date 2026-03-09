/**
 * @file s3_presigned_url.hpp
 * @brief Generate presigned URLs for S3-compatible storage
 *
 * Creates a URL with embedded query string authentication that can be
 * shared for temporary access to an S3 object without credentials.
 * No actual HTTP call is made.
 */

#pragma once

#include <string>
#include <chrono>
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_auth.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Generate a presigned URL for an S3 object
 * @param config S3 configuration
 * @param key Object key
 * @param expiration URL validity duration
 * @return Result containing the presigned URL or error
 *
 * The URL allows unauthenticated access to the object for the
 * specified duration. No HTTP request is made to S3.
 */
[[nodiscard]] inline Result<std::string> s3_presigned_url(
    const S3Config& config,
    const std::string& key,
    std::chrono::seconds expiration
) {
    if (key.empty()) {
        return Error::validationError("Object key cannot be empty for presigned URL");
    }

    int expires_seconds = static_cast<int>(expiration.count());
    if (expires_seconds <= 0 || expires_seconds > 604800) {
        return Error::validationError("Presigned URL expiration must be between 1 and 604800 seconds");
    }

    // Build the path for signing
    std::string path;
    if (config.use_path_style) {
        path = "/" + config.bucket + "/" + key;
    } else {
        path = "/" + key;
    }

    std::string host = config.buildHostHeader();

    // Generate the presigned query string
    std::string query_string = generate_presigned_query_string(
        "GET", host, path, config.region,
        config.access_key, config.secret_key,
        expires_seconds
    );

    // Build the full URL
    std::string url = config.buildBaseUrl() + "/" + key + "?" + query_string;

    return Result<std::string>(url);
}

} // namespace blob
} // namespace dbal
