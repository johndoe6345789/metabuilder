/**
 * @file s3_get_metadata.hpp
 * @brief Get blob metadata from S3-compatible storage
 *
 * Implements HEAD Object: HEAD /{bucket}/{key}
 * Parses response headers for size, content-type, etag,
 * last-modified, and x-amz-meta-* custom metadata.
 */

#pragma once

#include <string>
#include <map>
#include <algorithm>
#include <ctime>
#include <sstream>
#include <iomanip>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Parse HTTP date string (RFC 7231) to time_point
 *
 * Supports format: "Thu, 01 Dec 2022 12:00:00 GMT"
 *
 * @param date_str HTTP date string
 * @return Parsed time_point, or epoch if parsing fails
 */
[[nodiscard]] inline std::chrono::system_clock::time_point parse_http_date(
    const std::string& date_str
) {
    if (date_str.empty()) {
        return std::chrono::system_clock::time_point{};
    }

    // RFC 7231 format: "Thu, 01 Dec 2022 12:00:00 GMT"
    std::tm tm{};
    std::istringstream ss(date_str);
    ss >> std::get_time(&tm, "%a, %d %b %Y %H:%M:%S");

    if (ss.fail()) {
        // Try ISO 8601 as fallback
        ss.clear();
        ss.str(date_str);
        ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%S");
        if (ss.fail()) {
            return std::chrono::system_clock::time_point{};
        }
    }

    // Convert to time_t (assuming UTC)
    std::time_t tt = timegm(&tm);
    return std::chrono::system_clock::from_time_t(tt);
}

/**
 * @brief Extract custom metadata from S3 response headers
 *
 * S3 stores custom metadata with "x-amz-meta-" prefix.
 * This function strips the prefix and returns the key-value pairs.
 *
 * @param headers Response headers
 * @return Map of custom metadata keys to values
 */
[[nodiscard]] inline std::map<std::string, std::string> extract_custom_metadata(
    const std::map<std::string, std::string>& headers
) {
    std::map<std::string, std::string> metadata;
    const std::string prefix = "x-amz-meta-";

    for (const auto& [key, value] : headers) {
        std::string lower_key = key;
        std::transform(lower_key.begin(), lower_key.end(), lower_key.begin(), ::tolower);

        if (lower_key.find(prefix) == 0) {
            std::string meta_key = lower_key.substr(prefix.size());
            metadata[meta_key] = value;
        }
    }
    return metadata;
}

/**
 * @brief Get metadata for an S3 object
 * @param config S3 configuration
 * @param key Object key
 * @return Result containing BlobMetadata or error
 */
[[nodiscard]] inline Result<BlobMetadata> s3_get_metadata(
    const S3Config& config,
    const std::string& key
) {
    auto result = s3_http_request(config, "HEAD", key);
    if (result.isError()) {
        return Result<BlobMetadata>(result.error());
    }

    const auto& resp = result.value();
    if (!resp.is_success()) {
        return s3_response_to_error(resp, "GetMetadata " + key);
    }

    BlobMetadata meta;
    meta.key = key;

    // Parse Content-Length
    std::string content_length = resp.get_header("Content-Length");
    if (!content_length.empty()) {
        try {
            meta.size = std::stoull(content_length);
        } catch (...) {
            meta.size = 0;
        }
    }

    // Parse Content-Type
    meta.content_type = resp.get_header("Content-Type");
    if (meta.content_type.empty()) {
        meta.content_type = "application/octet-stream";
    }

    // Parse ETag
    meta.etag = resp.get_header("ETag");

    // Parse Last-Modified
    meta.last_modified = parse_http_date(resp.get_header("Last-Modified"));

    // Extract custom metadata (x-amz-meta-*)
    meta.custom_metadata = extract_custom_metadata(resp.headers);

    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
