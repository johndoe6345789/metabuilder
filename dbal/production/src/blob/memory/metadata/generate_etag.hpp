/**
 * @file generate_etag.hpp
 * @brief Generate ETag for blob data
 */

#pragma once

#include <string>
#include <vector>
#include <cstdio>
#include <functional>

namespace dbal {
namespace blob {

/**
 * @brief Generate ETag for blob data
 * @param data The blob data
 * @return ETag string
 */
[[nodiscard]] inline std::string generate_etag(const std::vector<char>& data) {
    size_t hash = std::hash<std::string>{}(std::string(data.begin(), data.end()));
    char buffer[32];
    snprintf(buffer, sizeof(buffer), "\"%016zx\"", hash);
    return std::string(buffer);
}

} // namespace blob
} // namespace dbal
