/**
 * @file s3_delete.hpp
 * @brief Delete blob from S3-compatible storage
 *
 * Implements DELETE Object: DELETE /{bucket}/{key}
 */

#pragma once

#include <string>
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Delete an object from S3
 * @param config S3 configuration
 * @param key Object key
 * @return Result containing true on success or error
 *
 * Note: S3 returns 204 No Content on successful delete.
 * S3 also returns 204 for non-existent keys (idempotent delete).
 * We explicitly check for existence first to match the BlobStorage
 * interface contract that expects NotFound for missing keys.
 */
[[nodiscard]] inline Result<bool> s3_delete(
    const S3Config& config,
    const std::string& key
) {
    // Check existence first to return proper NotFound error
    auto head_result = s3_http_request(config, "HEAD", key);
    if (head_result.isOk() && head_result.value().is_not_found()) {
        return Error::notFound("Blob not found: " + key);
    }
    if (head_result.isError()) {
        return Result<bool>(head_result.error());
    }

    auto result = s3_http_request(config, "DELETE", key);
    if (result.isError()) {
        return Result<bool>(result.error());
    }

    const auto& resp = result.value();
    // S3 returns 204 No Content on success
    if (resp.status_code == 204 || resp.is_success()) {
        return Result<bool>(true);
    }

    return s3_response_to_error(resp, "Delete " + key);
}

} // namespace blob
} // namespace dbal
