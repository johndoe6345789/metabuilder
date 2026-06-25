/**
 * @file s3_download.hpp
 * @brief Download blob from S3-compatible storage
 *
 * Implements GET Object: GET /{bucket}/{key}
 * Supports Range header for partial downloads (offset/length).
 */

#pragma once

#include <string>
#include <vector>
#include <map>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Download an object from S3
 * @param config S3 configuration
 * @param key Object key
 * @param options Download options (offset, length for partial downloads)
 * @return Result containing object data or error
 */
[[nodiscard]] inline Result<std::vector<char>> s3_download(
    const S3Config& config,
    const std::string& key,
    const DownloadOptions& options
) {
    std::map<std::string, std::string> extra_headers;

    // Build Range header for partial downloads
    if (options.offset.has_value() || options.length.has_value()) {
        size_t offset = options.offset.value_or(0);
        std::string range = "bytes=" + std::to_string(offset) + "-";

        if (options.length.has_value()) {
            // Range is inclusive on both ends
            size_t end = offset + options.length.value() - 1;
            range += std::to_string(end);
        }

        extra_headers["range"] = range;
    }

    auto result = s3_http_request(config, "GET", key, {}, extra_headers);
    if (result.isError()) {
        return Result<std::vector<char>>(result.error());
    }

    const auto& resp = result.value();
    if (!resp.is_success()) {
        return s3_response_to_error(resp, "Download " + key);
    }

    // Convert response body to vector<char>
    std::vector<char> data(resp.body.begin(), resp.body.end());
    return Result<std::vector<char>>(data);
}

} // namespace blob
} // namespace dbal
