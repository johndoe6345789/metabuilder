/**
 * @file fs_download.hpp
 * @brief Download blob from filesystem storage
 */

#pragma once

#include <algorithm>
#include <filesystem>
#include <fstream>
#include <mutex>
#include <string>
#include <vector>

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "key_to_path.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Download blob data from a file on the filesystem
 * @param root_dir Storage root directory
 * @param mutex Shared mutex for thread safety
 * @param key Blob key
 * @param options Download options (offset, length for range reads)
 * @return Result containing the blob data bytes
 */
inline Result<std::vector<char>> fs_download(
    const std::filesystem::path& root_dir,
    std::mutex& mutex,
    const std::string& key,
    const DownloadOptions& options
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

    auto file_size = std::filesystem::file_size(file_path);

    std::ifstream in(file_path, std::ios::binary);
    if (!in.is_open()) {
        return Error::internal("Failed to open file for reading: " + key);
    }

    if (options.offset.has_value() || options.length.has_value()) {
        size_t offset = options.offset.value_or(0);
        size_t length = options.length.value_or(file_size - offset);

        if (offset >= file_size) {
            return Error::validationError("Offset exceeds blob size");
        }

        length = std::min(length, static_cast<size_t>(file_size) - offset);

        in.seekg(static_cast<std::streamoff>(offset));
        if (in.fail()) {
            return Error::internal("Failed to seek in file: " + key);
        }

        std::vector<char> data(length);
        in.read(data.data(), static_cast<std::streamsize>(length));
        if (in.fail() && !in.eof()) {
            return Error::internal("Failed to read file: " + key);
        }

        // Adjust for actual bytes read (may be less if near EOF)
        auto bytes_read = static_cast<size_t>(in.gcount());
        data.resize(bytes_read);

        return Result<std::vector<char>>(std::move(data));
    }

    // Full file read
    std::vector<char> data(static_cast<size_t>(file_size));
    if (file_size > 0) {
        in.read(data.data(), static_cast<std::streamsize>(file_size));
        if (in.fail() && !in.eof()) {
            return Error::internal("Failed to read file: " + key);
        }
        auto bytes_read = static_cast<size_t>(in.gcount());
        data.resize(bytes_read);
    }

    return Result<std::vector<char>>(std::move(data));
}

} // namespace blob
} // namespace dbal
