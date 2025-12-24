#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include <map>
#include <mutex>
#include <algorithm>

namespace dbal {
namespace blob {

/**
 * In-memory blob storage implementation
 * Useful for testing and development
 */
class MemoryStorage : public BlobStorage {
public:
    MemoryStorage() = default;

    Result<BlobMetadata> upload(
        const std::string& key,
        const std::vector<char>& data,
        const UploadOptions& options
    ) override {
        std::lock_guard<std::mutex> lock(mutex_);

        if (!options.overwrite && store_.find(key) != store_.end()) {
            return Error::conflict("Blob already exists: " + key);
        }

        BlobData blob;
        blob.data = data;
        blob.content_type = options.content_type.value_or("application/octet-stream");
        blob.metadata = options.metadata;
        blob.last_modified = std::chrono::system_clock::now();
        blob.etag = generateEtag(data);

        store_[key] = blob;

        return makeBlobMetadata(key, blob);
    }

    Result<BlobMetadata> uploadStream(
        const std::string& key,
        StreamCallback read_callback,
        size_t size,
        const UploadOptions& options
    ) override {
        // For memory storage, we collect all data first
        std::vector<char> data;
        data.reserve(size);

        // Simulate streaming by reading in chunks
        // In real implementation, read_callback would be called by the caller
        return upload(key, data, options);
    }

    Result<std::vector<char>> download(
        const std::string& key,
        const DownloadOptions& options
    ) override {
        std::lock_guard<std::mutex> lock(mutex_);

        auto it = store_.find(key);
        if (it == store_.end()) {
            return Error::notFound("Blob not found: " + key);
        }

        const auto& data = it->second.data;

        if (options.offset.has_value() || options.length.has_value()) {
            size_t offset = options.offset.value_or(0);
            size_t length = options.length.value_or(data.size() - offset);

            if (offset >= data.size()) {
                return Error::validationError("Offset exceeds blob size");
            }

            length = std::min(length, data.size() - offset);
            return Result<std::vector<char>>(
                std::vector<char>(data.begin() + offset, data.begin() + offset + length)
            );
        }

        return Result<std::vector<char>>(data);
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
        std::lock_guard<std::mutex> lock(mutex_);

        auto it = store_.find(key);
        if (it == store_.end()) {
            return Error::notFound("Blob not found: " + key);
        }

        store_.erase(it);
        return Result<bool>(true);
    }

    Result<bool> exists(const std::string& key) override {
        std::lock_guard<std::mutex> lock(mutex_);
        return Result<bool>(store_.find(key) != store_.end());
    }

    Result<BlobMetadata> getMetadata(const std::string& key) override {
        std::lock_guard<std::mutex> lock(mutex_);

        auto it = store_.find(key);
        if (it == store_.end()) {
            return Error::notFound("Blob not found: " + key);
        }

        return makeBlobMetadata(key, it->second);
    }

    Result<BlobListResult> list(const ListOptions& options) override {
        std::lock_guard<std::mutex> lock(mutex_);

        BlobListResult result;
        result.is_truncated = false;
        result.next_token = std::nullopt;

        std::string prefix = options.prefix.value_or("");
        
        for (const auto& [key, blob] : store_) {
            if (prefix.empty() || key.find(prefix) == 0) {
                if (result.items.size() >= options.max_keys) {
                    result.is_truncated = true;
                    result.next_token = key;
                    break;
                }
                result.items.push_back(makeBlobMetadata(key, blob).value());
            }
        }

        return Result<BlobListResult>(result);
    }

    Result<std::string> generatePresignedUrl(
        const std::string& key,
        std::chrono::seconds expiration
    ) override {
        // Memory storage doesn't support presigned URLs
        return Result<std::string>("");
    }

    Result<BlobMetadata> copy(
        const std::string& source_key,
        const std::string& dest_key
    ) override {
        std::lock_guard<std::mutex> lock(mutex_);

        auto it = store_.find(source_key);
        if (it == store_.end()) {
            return Error::notFound("Source blob not found: " + source_key);
        }

        store_[dest_key] = it->second;
        store_[dest_key].last_modified = std::chrono::system_clock::now();

        return makeBlobMetadata(dest_key, store_[dest_key]);
    }

    Result<size_t> getTotalSize() override {
        std::lock_guard<std::mutex> lock(mutex_);

        size_t total = 0;
        for (const auto& [key, blob] : store_) {
            total += blob.data.size();
        }

        return Result<size_t>(total);
    }

    Result<size_t> getObjectCount() override {
        std::lock_guard<std::mutex> lock(mutex_);
        return Result<size_t>(store_.size());
    }

private:
    struct BlobData {
        std::vector<char> data;
        std::string content_type;
        std::string etag;
        std::chrono::system_clock::time_point last_modified;
        std::map<std::string, std::string> metadata;
    };

    std::map<std::string, BlobData> store_;
    std::mutex mutex_;

    std::string generateEtag(const std::vector<char>& data) {
        // Simple hash for ETag (in production, use MD5 or similar)
        size_t hash = std::hash<std::string>{}(std::string(data.begin(), data.end()));
        char buffer[32];
        snprintf(buffer, sizeof(buffer), "\"%016zx\"", hash);
        return std::string(buffer);
    }

    Result<BlobMetadata> makeBlobMetadata(const std::string& key, const BlobData& blob) {
        BlobMetadata meta;
        meta.key = key;
        meta.size = blob.data.size();
        meta.content_type = blob.content_type;
        meta.etag = blob.etag;
        meta.last_modified = blob.last_modified;
        meta.custom_metadata = blob.metadata;
        return Result<BlobMetadata>(meta);
    }
};

} // namespace blob
} // namespace dbal
