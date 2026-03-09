/**
 * @file s3_stats.hpp
 * @brief Get storage statistics from S3-compatible storage
 *
 * S3 has no native API for storage statistics. These functions
 * iterate over all objects using ListObjectsV2 to compute totals.
 */

#pragma once

#include <string>
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_list.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Get total size of all objects in the bucket
 * @param config S3 configuration
 * @return Result containing total size in bytes or error
 *
 * Iterates all objects using paginated ListObjectsV2 requests.
 * For large buckets this may take significant time.
 */
[[nodiscard]] inline Result<size_t> s3_total_size(const S3Config& config) {
    size_t total_size = 0;
    ListOptions options;
    options.max_keys = 1000;

    while (true) {
        auto result = s3_list(config, options);
        if (result.isError()) {
            return Result<size_t>(result.error());
        }

        const auto& list_result = result.value();
        for (const auto& item : list_result.items) {
            total_size += item.size;
        }

        if (!list_result.is_truncated || !list_result.next_token.has_value()) {
            break;
        }

        options.continuation_token = list_result.next_token;
    }

    return Result<size_t>(total_size);
}

/**
 * @brief Get total number of objects in the bucket
 * @param config S3 configuration
 * @return Result containing object count or error
 *
 * Iterates all objects using paginated ListObjectsV2 requests.
 * For large buckets this may take significant time.
 */
[[nodiscard]] inline Result<size_t> s3_object_count(const S3Config& config) {
    size_t count = 0;
    ListOptions options;
    options.max_keys = 1000;

    while (true) {
        auto result = s3_list(config, options);
        if (result.isError()) {
            return Result<size_t>(result.error());
        }

        const auto& list_result = result.value();
        count += list_result.items.size();

        if (!list_result.is_truncated || !list_result.next_token.has_value()) {
            break;
        }

        options.continuation_token = list_result.next_token;
    }

    return Result<size_t>(count);
}

} // namespace blob
} // namespace dbal
