/**
 * @file key_to_path.hpp
 * @brief Convert blob key to filesystem path
 *
 * Keys map directly to filesystem paths under the root directory.
 * Forward slashes in keys create subdirectories.
 * Example: key="media/images/photo.jpg" -> root_dir/media/images/photo.jpg
 */

#pragma once

#include <filesystem>
#include <string>

namespace dbal {
namespace blob {

/**
 * @brief Convert a blob key to a filesystem path
 * @param root_dir The storage root directory
 * @param key The blob key (may contain '/' for subdirectories)
 * @return Absolute filesystem path for the blob
 */
[[nodiscard]] inline std::filesystem::path key_to_path(
    const std::filesystem::path& root_dir,
    const std::string& key
) {
    return root_dir / key;
}

/**
 * @brief Validate that a key does not escape the root directory
 * @param root_dir The storage root directory
 * @param key The blob key
 * @return true if the key resolves to a path within root_dir
 *
 * Prevents path traversal attacks (e.g. key="../../etc/passwd")
 */
[[nodiscard]] inline bool is_key_safe(
    const std::filesystem::path& root_dir,
    const std::string& key
) {
    if (key.empty()) {
        return false;
    }

    // Reject keys with path traversal components
    if (key.find("..") != std::string::npos) {
        return false;
    }

    // Reject absolute paths
    if (key[0] == '/') {
        return false;
    }

    // Verify resolved path is within root
    auto resolved = std::filesystem::weakly_canonical(root_dir / key);
    auto root_resolved = std::filesystem::weakly_canonical(root_dir);
    auto root_str = root_resolved.string();

    return resolved.string().find(root_str) == 0;
}

} // namespace blob
} // namespace dbal
