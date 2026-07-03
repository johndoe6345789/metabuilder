/**
 * @file BlobStore.h
 * @brief Filesystem blob storage with MD5 ETag.
 */

#pragma once

#include "DigestUtil.h"

#include <filesystem>
#include <fstream>
#include <string>
#include <string_view>

namespace s3
{

/// @brief Content-addressed filesystem blob store.
class BlobStore
{
  public:
    explicit BlobStore(const std::filesystem::path& root) : root_(root)
    {
        std::filesystem::create_directories(root);
    }

    /// @brief Store data, return {etag, size, path}.
    struct StoreResult {
        std::string etag;
        size_t size;
        std::string path;
    };

    // Accept string_view so callers can write directly from the request body
    // buffer without making an intermediate copy of potentially large blobs.
    StoreResult store(const std::string& bucket, const std::string& key,
                      std::string_view data)
    {
        auto etag = md5hex(data);
        auto dir = root_ / bucket;
        std::filesystem::create_directories(dir);

        // Use etag-based path to dedup
        auto rel = bucket + "/" + etag;
        auto full = root_ / rel;

        std::ofstream f(full, std::ios::binary);
        f.write(data.data(), (std::streamsize)data.size());
        f.close();

        return {etag, data.size(), rel};
    }

    /// @brief Read blob by storage path.
    std::string read(const std::string& path)
    {
        auto full = root_ / path;
        if (!std::filesystem::exists(full))
            return {};
        std::ifstream f(full, std::ios::binary);
        return {std::istreambuf_iterator<char>(f),
                std::istreambuf_iterator<char>()};
    }

    /// @brief Delete blob by storage path.
    bool remove(const std::string& path)
    {
        return std::filesystem::remove(root_ / path);
    }

  private:
    std::filesystem::path root_;

};

} // namespace s3
