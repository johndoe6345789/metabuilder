/**
 * @file blob_storage_factory.hpp
 * @brief Factory for creating BlobStorage backends from environment variables
 *
 * Follows the same pattern as core::AdapterFactory — static methods that
 * read environment variables and return the appropriate implementation.
 *
 * Environment variables:
 *   DBAL_BLOB_BACKEND   - Backend type: memory, filesystem, s3 (default: memory)
 *   DBAL_BLOB_DIR       - Filesystem backend root directory
 *   DBAL_BLOB_URL       - S3-compatible endpoint URL
 *   DBAL_BLOB_BUCKET    - S3 bucket name
 *   DBAL_BLOB_REGION    - S3 region (default: us-east-1)
 *   DBAL_BLOB_ACCESS_KEY - S3 access key
 *   DBAL_BLOB_SECRET_KEY - S3 secret key
 *   DBAL_BLOB_PATH_STYLE - Use path-style addressing (default: true)
 */

#pragma once

#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "memory_storage.hpp"
#include "filesystem_storage.hpp"
#include "s3_storage.hpp"
#include "../config/env_parser.hpp"

#include <memory>
#include <string>
#include <algorithm>
#include <cctype>
#include <spdlog/spdlog.h>

namespace dbal {
namespace blob {

/**
 * @class BlobStorageFactory
 * @brief Creates BlobStorage instances from configuration
 *
 * Two creation paths:
 *   1. createFromEnv() — reads DBAL_BLOB_* env vars (used by daemon startup)
 *   2. create(backend, config) — explicit parameters (used by tests / admin API)
 */
class BlobStorageFactory {
public:
    /**
     * @brief Create a BlobStorage backend from environment variables
     *
     * Reads DBAL_BLOB_BACKEND to determine which implementation to create,
     * then reads backend-specific env vars for configuration.
     *
     * @return Unique pointer to BlobStorage instance
     * @throws Error if configuration is invalid or missing required vars
     */
    static std::unique_ptr<BlobStorage> createFromEnv() {
        std::string backend = config::EnvParser::get("DBAL_BLOB_BACKEND", "memory");

        // Normalize to lowercase
        std::transform(backend.begin(), backend.end(), backend.begin(),
                       [](unsigned char c) { return std::tolower(c); });

        spdlog::info("Blob storage backend: {}", backend);

        if (backend == "memory") {
            return createMemory();
        } else if (backend == "filesystem" || backend == "fs") {
            return createFilesystemFromEnv();
        } else if (backend == "s3") {
            return createS3FromEnv();
        }

        throw Error::validationError("Unsupported blob storage backend: " + backend +
                                      " (supported: memory, filesystem, s3)");
    }

    /**
     * @brief Create an in-memory BlobStorage instance
     * @return Unique pointer to MemoryStorage
     */
    static std::unique_ptr<BlobStorage> createMemory() {
        spdlog::info("Blob storage: using in-memory backend");
        return std::make_unique<MemoryStorage>();
    }

    /**
     * @brief Create a filesystem BlobStorage instance
     * @param root_dir Root directory for blob storage
     * @return Unique pointer to FilesystemStorage
     * @throws Error if root_dir is empty or cannot be created
     */
    static std::unique_ptr<BlobStorage> createFilesystem(const std::string& root_dir) {
        if (root_dir.empty()) {
            throw Error::validationError(
                "Filesystem blob storage requires a root directory "
                "(set DBAL_BLOB_DIR environment variable)"
            );
        }
        spdlog::info("Blob storage: using filesystem backend at {}", root_dir);
        return std::make_unique<FilesystemStorage>(std::filesystem::path(root_dir));
    }

    /**
     * @brief Create an S3-compatible BlobStorage instance
     * @param config S3 connection configuration
     * @return Unique pointer to S3Storage
     * @throws Error if required S3 config fields are missing
     */
    static std::unique_ptr<BlobStorage> createS3(const S3Config& config) {
        if (config.endpoint.empty()) {
            throw Error::validationError(
                "S3 blob storage requires an endpoint URL "
                "(set DBAL_BLOB_URL environment variable)"
            );
        }
        if (config.bucket.empty()) {
            throw Error::validationError(
                "S3 blob storage requires a bucket name "
                "(set DBAL_BLOB_BUCKET environment variable)"
            );
        }
        if (config.access_key.empty() || config.secret_key.empty()) {
            throw Error::validationError(
                "S3 blob storage requires access credentials "
                "(set DBAL_BLOB_ACCESS_KEY and DBAL_BLOB_SECRET_KEY environment variables)"
            );
        }
        spdlog::info("Blob storage: using S3 backend at {} bucket={}",
                     config.endpoint, config.bucket);
        return std::make_unique<S3Storage>(config);
    }

    /**
     * @brief Check if a blob storage backend type is supported
     * @param backend Backend type string
     * @return true if supported
     */
    static bool isSupported(const std::string& backend) {
        std::string lower = backend;
        std::transform(lower.begin(), lower.end(), lower.begin(),
                       [](unsigned char c) { return std::tolower(c); });
        return lower == "memory" ||
               lower == "filesystem" || lower == "fs" ||
               lower == "s3";
    }

private:
    /**
     * @brief Create FilesystemStorage from DBAL_BLOB_DIR env var
     */
    static std::unique_ptr<BlobStorage> createFilesystemFromEnv() {
        std::string root_dir = config::EnvParser::get("DBAL_BLOB_DIR", "");
        return createFilesystem(root_dir);
    }

    /**
     * @brief Create S3Storage from DBAL_BLOB_* env vars
     */
    static std::unique_ptr<BlobStorage> createS3FromEnv() {
        S3Config config;
        config.endpoint       = config::EnvParser::get("DBAL_BLOB_URL", "");
        config.bucket         = config::EnvParser::get("DBAL_BLOB_BUCKET", "");
        config.region         = config::EnvParser::get("DBAL_BLOB_REGION", "us-east-1");
        config.access_key     = config::EnvParser::get("DBAL_BLOB_ACCESS_KEY", "");
        config.secret_key     = config::EnvParser::get("DBAL_BLOB_SECRET_KEY", "");
        config.use_path_style = config::EnvParser::getBool("DBAL_BLOB_PATH_STYLE", true);
        return createS3(config);
    }
};

} // namespace blob
} // namespace dbal
