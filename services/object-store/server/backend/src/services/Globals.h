/**
 * @file Globals.h
 * @brief S3 server global state initialization.
 */

#pragma once

#include "BlobStore.h"
#include "DbPool.h"

#include <filesystem>
#include <memory>
#include <string>

namespace s3
{

/// @brief Central service registry for the S3 server.
struct Globals {
    static inline std::unique_ptr<BlobStore> blobs;
    static inline std::string region = "us-east-1";

    /// @brief Initialize all services.
    static void init(const std::filesystem::path& dataDir,
                     const std::string& dbConn, const std::string& rgn)
    {
        namespace fs = std::filesystem;
        fs::create_directories(dataDir);
        blobs = std::make_unique<BlobStore>(dataDir / "blobs");
        region = rgn;
        DbPool::init(dbConn);
    }
};

} // namespace s3
