/**
 * @file fs_list.hpp
 * @brief List blobs in filesystem storage
 */

#pragma once

#include <algorithm>
#include <chrono>
#include <filesystem>
#include <fstream>
#include <mutex>
#include <string>
#include <vector>

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "key_to_path.hpp"
#include "content_type_map.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Extract the relative key from an absolute path given the root
 * @param root_dir Storage root directory
 * @param abs_path Absolute file path
 * @return Relative key string using forward slashes
 */
[[nodiscard]] inline std::string path_to_key(
    const std::filesystem::path& root_dir,
    const std::filesystem::path& abs_path
) {
    auto rel = std::filesystem::relative(abs_path, root_dir);
    // Normalize to forward slashes for cross-platform consistency
    auto key = rel.generic_string();
    return key;
}

/**
 * @brief List blobs from filesystem storage with prefix filtering and pagination
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param options List options (prefix, continuation_token, max_keys)
 * @return Result containing BlobListResult
 */
inline Result<BlobListResult> fs_list(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const ListOptions& options
) {
    std::lock_guard<std::mutex> lock(mutex);

    if (!std::filesystem::exists(root_dir)) {
        BlobListResult empty_result;
        empty_result.is_truncated = false;
        return Result<BlobListResult>(empty_result);
    }

    BlobListResult result;
    result.is_truncated = false;
    result.next_token = std::nullopt;

    std::string prefix = options.prefix.value_or("");
    std::string continuation = options.continuation_token.value_or("");

    // Collect all matching keys first, then sort for consistent ordering
    std::vector<std::string> matching_keys;

    std::error_code ec;
    for (auto it = std::filesystem::recursive_directory_iterator(root_dir, ec);
         it != std::filesystem::recursive_directory_iterator(); ++it) {

        if (ec) break;

        if (!it->is_regular_file()) continue;

        // Skip temp files from atomic writes
        auto filename = it->path().filename().string();
        if (filename.size() > 4 && filename.substr(filename.size() - 4) == ".tmp") {
            continue;
        }

        auto key = path_to_key(root_dir, it->path());

        // Apply prefix filter
        if (!prefix.empty() && key.find(prefix) != 0) {
            continue;
        }

        matching_keys.push_back(key);
    }

    // Sort keys for deterministic pagination
    std::sort(matching_keys.begin(), matching_keys.end());

    // Apply continuation token (skip keys <= token)
    bool past_token = continuation.empty();
    size_t count = 0;

    for (const auto& key : matching_keys) {
        if (!past_token) {
            if (key > continuation) {
                past_token = true;
            } else {
                continue;
            }
        }

        if (count >= options.max_keys) {
            result.is_truncated = true;
            result.next_token = key;
            break;
        }

        auto file_path = key_to_path(root_dir, key);

        std::error_code size_ec;
        auto file_size = std::filesystem::file_size(file_path, size_ec);
        if (size_ec) continue;

        auto last_write = std::filesystem::last_write_time(file_path, size_ec);
        if (size_ec) continue;

        auto sctp = std::chrono::time_point_cast<std::chrono::system_clock::duration>(
            last_write - std::filesystem::file_time_type::clock::now() +
            std::chrono::system_clock::now()
        );

        BlobMetadata meta;
        meta.key = key;
        meta.size = static_cast<size_t>(file_size);
        meta.content_type = guess_content_type(key);
        // Lightweight: skip ETag computation for listing (would require reading every file)
        meta.etag = "";
        meta.last_modified = sctp;

        result.items.push_back(std::move(meta));
        ++count;
    }

    return Result<BlobListResult>(result);
}

} // namespace blob
} // namespace dbal
