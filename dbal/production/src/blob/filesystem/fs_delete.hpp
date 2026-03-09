/**
 * @file fs_delete.hpp
 * @brief Delete blob from filesystem storage
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
 * @brief Delete a blob file from the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param key Blob key to delete
 * @return Result<bool> true on success
 *
 * After deletion, removes empty parent directories up to (but not including)
 * the root directory to keep the filesystem tidy.
 */
inline Result<bool> fs_delete(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const std::string& key
) {
    if (!is_key_safe(root_dir, key)) {
        return Error::validationError("Invalid blob key: " + key);
    }

    std::lock_guard<std::mutex> lock(mutex);

    auto file_path = key_to_path(root_dir, key);

    if (!std::filesystem::exists(file_path)) {
        return Error::notFound("Blob not found: " + key);
    }

    std::error_code ec;
    if (!std::filesystem::remove(file_path, ec) || ec) {
        return Error::internal("Failed to delete blob: " + key + " (" + ec.message() + ")");
    }

    // Clean up empty parent directories (up to root_dir)
    auto parent = file_path.parent_path();
    auto root_canonical = std::filesystem::weakly_canonical(root_dir);

    while (parent != root_canonical && parent.string().length() > root_canonical.string().length()) {
        if (std::filesystem::is_empty(parent, ec) && !ec) {
            std::filesystem::remove(parent, ec);
            if (ec) break;
            parent = parent.parent_path();
        } else {
            break;
        }
    }

    return Result<bool>(true);
}

} // namespace blob
} // namespace dbal
