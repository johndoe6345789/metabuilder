/**
 * @file fs_upload.hpp
 * @brief Upload blob to filesystem storage
 */

#pragma once

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
 * @brief Upload blob data to a file on the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param key Blob key (becomes relative path)
 * @param data Blob content bytes
 * @param options Upload options (content_type, metadata, overwrite)
 * @return Result containing BlobMetadata on success
 */
inline Result<BlobMetadata> fs_upload(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const std::string& key,
    const std::vector<char>& data,
    const UploadOptions& options
) {
    if (!is_key_safe(root_dir, key)) {
        return Error::validationError("Invalid blob key: " + key);
    }

    std::lock_guard<std::mutex> lock(mutex);

    auto file_path = key_to_path(root_dir, key);

    if (!options.overwrite && std::filesystem::exists(file_path)) {
        return Error::conflict("Blob already exists: " + key);
    }

    // Create parent directories
    std::error_code ec;
    std::filesystem::create_directories(file_path.parent_path(), ec);
    if (ec) {
        return Error::internal("Failed to create directories for: " + key + " (" + ec.message() + ")");
    }

    // Write file atomically: write to temp, then rename
    auto temp_path = file_path;
    temp_path += ".tmp";

    {
        std::ofstream out(temp_path, std::ios::binary | std::ios::trunc);
        if (!out.is_open()) {
            return Error::internal("Failed to open file for writing: " + temp_path.string());
        }

        if (!data.empty()) {
            out.write(data.data(), static_cast<std::streamsize>(data.size()));
        }

        out.flush();
        if (out.fail()) {
            std::filesystem::remove(temp_path, ec);
            return Error::internal("Failed to write blob data: " + key);
        }
    }

    // Rename temp file to final path
    std::filesystem::rename(temp_path, file_path, ec);
    if (ec) {
        std::filesystem::remove(temp_path);
        return Error::internal("Failed to finalize blob: " + key + " (" + ec.message() + ")");
    }

    // Build metadata
    BlobMetadata meta;
    meta.key = key;
    meta.size = data.size();
    meta.content_type = options.content_type.value_or(guess_content_type(key));
    meta.etag = generate_etag(data);
    meta.last_modified = std::chrono::system_clock::now();
    meta.custom_metadata = options.metadata;

    return Result<BlobMetadata>(meta);
}

} // namespace blob
} // namespace dbal
