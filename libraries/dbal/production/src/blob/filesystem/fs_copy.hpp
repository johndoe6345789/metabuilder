/**
 * @file fs_copy.hpp
 * @brief Copy blob in filesystem storage
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
 * @brief Copy a blob from source key to destination key on the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param source_key Source blob key
 * @param dest_key Destination blob key
 * @return Result containing BlobMetadata of the new copy
 */
inline Result<BlobMetadata> fs_copy(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const std::string& source_key,
    const std::string& dest_key
) {
    if (!is_key_safe(root_dir, source_key)) {
        return Error::validationError("Invalid source key: " + source_key);
    }
    if (!is_key_safe(root_dir, dest_key)) {
        return Error::validationError("Invalid destination key: " + dest_key);
    }

    std::lock_guard<std::mutex> lock(mutex);

    auto source_path = key_to_path(root_dir, source_key);
    auto dest_path = key_to_path(root_dir, dest_key);

    if (!std::filesystem::exists(source_path)) {
        return Error::notFound("Source blob not found: " + source_key);
    }

    if (!std::filesystem::is_regular_file(source_path)) {
        return Error::validationError("Source key refers to a directory: " + source_key);
    }

    // Create destination parent directories
    std::error_code ec;
    std::filesystem::create_directories(dest_path.parent_path(), ec);
    if (ec) {
        return Error::internal("Failed to create directories for: " + dest_key + " (" + ec.message() + ")");
    }

    // Copy file
    std::filesystem::copy_file(
        source_path, dest_path,
        std::filesystem::copy_options::overwrite_existing, ec
    );
    if (ec) {
        return Error::internal("Failed to copy blob: " + source_key + " -> " + dest_key + " (" + ec.message() + ")");
    }

    // Read destination file to compute ETag
    auto file_size = std::filesystem::file_size(dest_path, ec);
    if (ec) {
        return Error::internal("Failed to read copied file size: " + dest_key);
    }

    std::vector<char> data(static_cast<size_t>(file_size));
    if (file_size > 0) {
        std::ifstream in(dest_path, std::ios::binary);
        if (!in.is_open()) {
            return Error::internal("Failed to open copied file: " + dest_key);
        }
        in.read(data.data(), static_cast<std::streamsize>(file_size));
    }

    BlobMetadata meta;
    meta.key = dest_key;
    meta.size = static_cast<size_t>(file_size);
    meta.content_type = guess_content_type(dest_key);
    meta.etag = generate_etag(data);
    meta.last_modified = std::chrono::system_clock::now();

    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
