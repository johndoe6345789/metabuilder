/**
 * @file fs_stats.hpp
 * @brief Storage statistics for filesystem blob storage
 */

#pragma once

#include <filesystem>
#include <mutex>

#include "dbal/errors.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Get total size of all blobs in the filesystem store
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @return Result<size_t> total bytes across all blobs
 */
inline Result<size_t> fs_total_size(
    const std::filesystem::path& root_dir,
    std::mutex& mutex
) {
    std::lock_guard<std::mutex> lock(mutex);

    if (!std::filesystem::exists(root_dir)) {
        return Result<size_t>(static_cast<size_t>(0));
    }

    size_t total = 0;
    std::error_code ec;

    for (auto it = std::filesystem::recursive_directory_iterator(root_dir, ec);
         it != std::filesystem::recursive_directory_iterator(); ++it) {

        if (ec) break;
        if (!it->is_regular_file()) continue;

        // Skip temp files
        auto filename = it->path().filename().string();
        if (filename.size() > 4 && filename.substr(filename.size() - 4) == ".tmp") {
            continue;
        }

        auto fsize = std::filesystem::file_size(it->path(), ec);
        if (!ec) {
            total += static_cast<size_t>(fsize);
        }
    }

    return Result<size_t>(total);
}

/**
 * @brief Get count of all blobs in the filesystem store
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @return Result<size_t> number of blob files
 */
inline Result<size_t> fs_object_count(
    const std::filesystem::path& root_dir,
    std::mutex& mutex
) {
    std::lock_guard<std::mutex> lock(mutex);

    if (!std::filesystem::exists(root_dir)) {
        return Result<size_t>(static_cast<size_t>(0));
    }

    size_t count = 0;
    std::error_code ec;

    for (auto it = std::filesystem::recursive_directory_iterator(root_dir, ec);
         it != std::filesystem::recursive_directory_iterator(); ++it) {

        if (ec) break;
        if (!it->is_regular_file()) continue;

        // Skip temp files
        auto filename = it->path().filename().string();
        if (filename.size() > 4 && filename.substr(filename.size() - 4) == ".tmp") {
            continue;
        }

        ++count;
    }

    return Result<size_t>(count);
}

} // namespace blob
} // namespace dbal
