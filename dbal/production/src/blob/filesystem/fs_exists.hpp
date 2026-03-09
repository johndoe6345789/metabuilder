/**
 * @file fs_exists.hpp
 * @brief Check if blob exists in filesystem storage
 */

#pragma once

#include <filesystem>
#include <mutex>
#include <string>

#include "dbal/errors.hpp"
#include "key_to_path.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Check if a blob exists on the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param key Blob key to check
 * @return Result<bool> true if blob exists, false otherwise
 */
inline Result<bool> fs_exists(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const std::string& key
) {
    if (!is_key_safe(root_dir, key)) {
        return Error::validationError("Invalid blob key: " + key);
    }

    std::lock_guard<std::mutex> lock(mutex);

    auto file_path = key_to_path(root_dir, key);
    return Result<bool>(
        std::filesystem::exists(file_path) &&
        std::filesystem::is_regular_file(file_path)
    );
}

} // namespace blob
} // namespace dbal
