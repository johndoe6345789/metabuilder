/**
 * @file fs_presigned_url.hpp
 * @brief Presigned URL stub for filesystem storage (not supported)
 */

#pragma once

#include <chrono>
#include <string>

#include "dbal/errors.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Generate presigned URL (not supported for filesystem storage)
 * @param key Blob key (unused)
 * @param expiration Expiration duration (unused)
 * @return Result containing empty string (presigned URLs not applicable)
 */
inline Result<std::string> fs_presigned_url(
    const std::string& /*key*/,
    std::chrono::seconds /*expiration*/
) {
    return Result<std::string>(std::string(""));
}

} // namespace blob
} // namespace dbal
