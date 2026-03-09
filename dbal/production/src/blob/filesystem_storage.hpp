/**
 * @file filesystem_storage.hpp
 * @brief Filesystem blob storage - thin wrapper for micro-functions
 *
 * Content-addressed filesystem blob store. Keys map directly to filesystem
 * paths under the root directory, with forward slashes creating subdirectories.
 * Example: key="media/images/photo.jpg" -> {root_dir}/media/images/photo.jpg
 *
 * Thread-safe via mutex. Delegates all operations to header-only micro-functions
 * in the filesystem/ directory, following the same decomposition pattern as
 * MemoryStorage.
 */

#pragma once

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include <filesystem>
#include <mutex>

#include "filesystem/key_to_path.hpp"
#include "filesystem/content_type_map.hpp"
#include "filesystem/fs_upload.hpp"
#include "filesystem/fs_download.hpp"
#include "filesystem/fs_delete.hpp"
#include "filesystem/fs_exists.hpp"
#include "filesystem/fs_get_metadata.hpp"
#include "filesystem/fs_list.hpp"
#include "filesystem/fs_copy.hpp"
#include "filesystem/fs_stats.hpp"
#include "filesystem/fs_presigned_url.hpp"

namespace dbal {
namespace blob {

/**
 * @class FilesystemStorage
 * @brief Filesystem-backed blob storage implementation
 *
 * Stores blobs as regular files under a root directory. Key paths are preserved
 * as-is, with '/' separators creating subdirectory hierarchies. Atomic writes
 * are performed via temp file + rename. Empty parent directories are cleaned up
 * on delete. Path traversal attacks are prevented by key validation.
 */
class FilesystemStorage : public BlobStorage {
public:
    /**
     * @brief Construct filesystem storage rooted at the given directory
     * @param root_dir Root directory for blob storage (created if it does not exist)
     * @throws Error if the root directory cannot be created
     */
    explicit FilesystemStorage(std::filesystem::path root_dir)
        : root_dir_(std::move(root_dir))
    {
        std::error_code ec;
        std::filesystem::create_directories(root_dir_, ec);
        if (ec) {
            throw Error::internal(
                "Failed to create blob storage root: " + root_dir_.string() +
                " (" + ec.message() + ")"
            );
        }
        // Canonicalize after creation to resolve symlinks
        root_dir_ = std::filesystem::canonical(root_dir_, ec);
        if (ec) {
            throw Error::internal(
                "Failed to canonicalize blob storage root: " + root_dir_.string() +
                " (" + ec.message() + ")"
            );
        }
    }

    Result<BlobMetadata> upload(
        const std::string& key,
        const std::vector<char>& data,
        const UploadOptions& options
    ) override {
        return fs_upload(root_dir_, mutex_, key, data, options);
    }

    Result<BlobMetadata> uploadStream(
        const std::string& key,
        StreamCallback read_callback,
        size_t size,
        const UploadOptions& options
    ) override {
        // Collect streamed data into a buffer, then delegate to upload
        std::vector<char> data;
        data.reserve(size);
        read_callback(nullptr, 0); // Signal start (no-op for most callbacks)
        // For streaming, the caller writes into the buffer via callback
        // Since our interface doesn't provide a write target, collect into vector
        data.resize(size);
        if (size > 0) {
            read_callback(data.data(), size);
        }
        return upload(key, data, options);
    }

    Result<std::vector<char>> download(
        const std::string& key,
        const DownloadOptions& options
    ) override {
        return fs_download(root_dir_, mutex_, key, options);
    }

    Result<bool> downloadStream(
        const std::string& key,
        StreamCallback write_callback,
        const DownloadOptions& options
    ) override {
        auto data_result = download(key, options);
        if (data_result.isError()) {
            return Result<bool>(data_result.error());
        }
        const auto& data = data_result.value();
        if (!data.empty()) {
            write_callback(data.data(), data.size());
        }
        return Result<bool>(true);
    }

    Result<bool> deleteBlob(const std::string& key) override {
        return fs_delete(root_dir_, mutex_, key);
    }

    Result<bool> exists(const std::string& key) override {
        return fs_exists(root_dir_, mutex_, key);
    }

    Result<BlobMetadata> getMetadata(const std::string& key) override {
        return fs_get_metadata(root_dir_, mutex_, key);
    }

    Result<BlobListResult> list(const ListOptions& options) override {
        return fs_list(root_dir_, mutex_, options);
    }

    Result<std::string> generatePresignedUrl(
        const std::string& key,
        std::chrono::seconds expiration
    ) override {
        return fs_presigned_url(key, expiration);
    }

    Result<BlobMetadata> copy(
        const std::string& source_key,
        const std::string& dest_key
    ) override {
        return fs_copy(root_dir_, mutex_, source_key, dest_key);
    }

    Result<size_t> getTotalSize() override {
        return fs_total_size(root_dir_, mutex_);
    }

    Result<size_t> getObjectCount() override {
        return fs_object_count(root_dir_, mutex_);
    }

    /**
     * @brief Get the root directory path
     * @return Canonical root directory path
     */
    const std::filesystem::path& rootDir() const { return root_dir_; }

private:
    std::filesystem::path root_dir_;
    std::mutex mutex_;
};

} // namespace blob
} // namespace dbal
