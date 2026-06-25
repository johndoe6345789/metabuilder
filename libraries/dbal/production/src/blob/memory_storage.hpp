/**
 * @file memory_storage.hpp
 * @brief Memory storage class - thin wrapper for micro-functions
 */

#pragma once

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include <map>
#include <mutex>

#include "memory/blob_data.hpp"
#include "memory/metadata/generate_etag.hpp"
#include "memory/metadata/make_blob_metadata.hpp"
#include "memory/operations/transfer/memory_upload.hpp"
#include "memory/operations/transfer/memory_download.hpp"
#include "memory/operations/memory_delete.hpp"
#include "memory/operations/query/memory_exists.hpp"
#include "memory/metadata/memory_get_metadata.hpp"
#include "memory/operations/query/memory_list.hpp"
#include "memory/operations/transfer/memory_copy.hpp"
#include "memory/operations/query/memory_stats.hpp"

namespace dbal {
namespace blob {

/**
 * @class MemoryStorage
 * @brief In-memory blob storage implementation
 */
class MemoryStorage : public BlobStorage {
public:
    MemoryStorage() = default;

    Result<BlobMetadata> upload(
        const std::string& key,
        const std::vector<char>& data,
        const UploadOptions& options
    ) override {
        return memory_upload(store_, mutex_, key, data, options);
    }

    Result<BlobMetadata> uploadStream(
        const std::string& key,
        StreamCallback read_callback,
        size_t size,
        const UploadOptions& options
    ) override {
        std::vector<char> data;
        data.reserve(size);
        return upload(key, data, options);
    }

    Result<std::vector<char>> download(
        const std::string& key,
        const DownloadOptions& options
    ) override {
        return memory_download(store_, mutex_, key, options);
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
        return memory_delete(store_, mutex_, key);
    }

    Result<bool> exists(const std::string& key) override {
        return memory_exists(store_, mutex_, key);
    }

    Result<BlobMetadata> getMetadata(const std::string& key) override {
        return memory_get_metadata(store_, mutex_, key);
    }

    Result<BlobListResult> list(const ListOptions& options) override {
        return memory_list(store_, mutex_, options);
    }

    Result<std::string> generatePresignedUrl(
        const std::string& key,
        std::chrono::seconds expiration
    ) override {
        return Result<std::string>("");
    }

    Result<BlobMetadata> copy(
        const std::string& source_key,
        const std::string& dest_key
    ) override {
        return memory_copy(store_, mutex_, source_key, dest_key);
    }

    Result<size_t> getTotalSize() override {
        return memory_total_size(store_, mutex_);
    }

    Result<size_t> getObjectCount() override {
        return memory_object_count(store_, mutex_);
    }

private:
    std::map<std::string, BlobData> store_;
    std::mutex mutex_;
};

} // namespace blob
} // namespace dbal
