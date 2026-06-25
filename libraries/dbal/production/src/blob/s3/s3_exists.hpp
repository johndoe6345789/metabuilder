/**
 * @file s3_exists.hpp
 * @brief Check if blob exists in S3-compatible storage
 *
 * Implements HEAD Object: HEAD /{bucket}/{key}
 * Returns true if object exists (200), false if not (404).
 */

#pragma once

#include <string>
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Check if an object exists in S3
 * @param config S3 configuration
 * @param key Object key
 * @return Result containing true/false or error
 */
[[nodiscard]] inline Result<bool> s3_exists(
    const S3Config& config,
    const std::string& key
) {
    auto result = s3_http_request(config, "HEAD", key);
    if (result.isError()) {
        return Result<bool>(result.error());
    }

    const auto& resp = result.value();
    if (resp.is_success()) {
        return Result<bool>(true);
    }
    if (resp.is_not_found()) {
        return Result<bool>(false);
    }

    // Other error
    return s3_response_to_error(resp, "Exists check " + key);
}

} // namespace blob
} // namespace dbal
