#ifndef DBAL_BLOB_STORAGE_HPP
#define DBAL_BLOB_STORAGE_HPP

#include "dbal/result.hpp"
#include <string>
#include <vector>
#include <map>
#include <optional>
#include <functional>
#include <chrono>

namespace dbal {
namespace blob {

struct BlobMetadata {
    std::string key;
    size_t size;
    std::string content_type;
    std::string etag;
    std::chrono::system_clock::time_point last_modified;
    std::map<std::string, std::string> custom_metadata;
};

struct BlobListResult {
    std::vector<BlobMetadata> items;
    std::optional<std::string> next_token;
    bool is_truncated;
};

struct UploadOptions {
    std::optional<std::string> content_type;
    std::map<std::string, std::string> metadata;
    bool overwrite = true;
};

struct DownloadOptions {
    std::optional<size_t> offset;
    std::optional<size_t> length;
};

struct ListOptions {
    std::optional<std::string> prefix;
    std::optional<std::string> continuation_token;
    size_t max_keys = 1000;
};

// Callback for streaming uploads/downloads
using StreamCallback = std::function<void(const char* data, size_t size)>;

/**
 * Abstract interface for blob storage backends
 * Supports S3, filesystem, and in-memory implementations
 */
class BlobStorage {
public:
    virtual ~BlobStorage() = default;

    /**
     * Upload data to blob storage
     */
    virtual Result<BlobMetadata> upload(
        const std::string& key,
        const std::vector<char>& data,
        const UploadOptions& options = {}
    ) = 0;

    /**
     * Upload from stream (for large files)
     */
    virtual Result<BlobMetadata> uploadStream(
        const std::string& key,
        StreamCallback read_callback,
        size_t size,
        const UploadOptions& options = {}
    ) = 0;

    /**
     * Download data from blob storage
     */
    virtual Result<std::vector<char>> download(
        const std::string& key,
        const DownloadOptions& options = {}
    ) = 0;

    /**
     * Download to stream (for large files)
     */
    virtual Result<bool> downloadStream(
        const std::string& key,
        StreamCallback write_callback,
        const DownloadOptions& options = {}
    ) = 0;

    /**
     * Delete a blob
     */
    virtual Result<bool> deleteBlob(const std::string& key) = 0;

    /**
     * Check if blob exists
     */
    virtual Result<bool> exists(const std::string& key) = 0;

    /**
     * Get blob metadata without downloading content
     */
    virtual Result<BlobMetadata> getMetadata(const std::string& key) = 0;

    /**
     * List blobs with optional prefix filter
     */
    virtual Result<BlobListResult> list(const ListOptions& options = {}) = 0;

    /**
     * Generate presigned URL for temporary access (S3 only)
     * Returns empty string for non-S3 implementations
     */
    virtual Result<std::string> generatePresignedUrl(
        const std::string& key,
        std::chrono::seconds expiration = std::chrono::seconds(3600)
    ) = 0;

    /**
     * Copy blob to another location
     */
    virtual Result<BlobMetadata> copy(
        const std::string& source_key,
        const std::string& dest_key
    ) = 0;

    /**
     * Get storage statistics
     */
    virtual Result<size_t> getTotalSize() = 0;
    virtual Result<size_t> getObjectCount() = 0;
};

} // namespace blob
} // namespace dbal

#endif // DBAL_BLOB_STORAGE_HPP
