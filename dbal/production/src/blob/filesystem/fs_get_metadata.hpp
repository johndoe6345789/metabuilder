/**
 * @file fs_get_metadata.hpp
 * @brief Get blob metadata from filesystem storage
 */

#pragma once

#include <chrono>
#include <filesystem>
#include <fstream>
#include <mutex>
#include <string>
#include <vector>

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "../memory/metadata/generate_etag.hpp"
#include "key_to_path.hpp"
#include "content_type_map.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Get metadata for a blob on the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param key Blob key
 * @return Result containing BlobMetadata
 *
 * Reads the file to compute the ETag. Uses file_size and last_write_time
 * from the filesystem. Content type is guessed from the file extension.
 */
inline Result<BlobMetadata> fs_get_metadata(
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

    if (!std::filesystem::is_regular_file(file_path)) {
        return Error::validationError("Key refers to a directory, not a blob: " + key);
    }

    std::error_code ec;
    auto file_size = std::filesystem::file_size(file_path, ec);
    if (ec) {
        return Error::internal("Failed to read file size: " + key + " (" + ec.message() + ")");
    }

    auto last_write = std::filesystem::last_write_time(file_path, ec);
    if (ec) {
        return Error::internal("Failed to read file time: " + key + " (" + ec.message() + ")");
    }

    // Convert file_time_type to system_clock::time_point
    // C++17: use duration_cast through the file clock epoch
    auto sctp = std::chrono::time_point_cast<std::chrono::system_clock::duration>(
        last_write - std::filesystem::file_time_type::clock::now() +
        std::chrono::system_clock::now()
    );

    // Read file content to compute ETag
    std::vector<char> data(static_cast<size_t>(file_size));
    if (file_size > 0) {
        std::ifstream in(file_path, std::ios::binary);
        if (!in.is_open()) {
            return Error::internal("Failed to open file for metadata: " + key);
        }
        in.read(data.data(), static_cast<std::streamsize>(file_size));
    }

    BlobMetadata meta;
    meta.key = key;
    meta.size = static_cast<size_t>(file_size);
    meta.content_type = guess_content_type(key);
    meta.etag = generate_etag(data);
    meta.last_modified = sctp;

    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
