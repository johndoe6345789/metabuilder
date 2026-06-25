/**
 * @file blob_route_handler.hpp
 * @brief RESTful blob storage endpoint handlers
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <memory>
#include "dbal/storage/blob_storage.hpp"

namespace dbal {
namespace daemon {
namespace handlers {

using namespace dbal::blob;

/**
 * @class BlobRouteHandler
 * @brief Handles RESTful blob storage operations
 *
 * Supports multi-tenant blob routes in the format:
 * /{tenant}/{package}/blob[/{key}[/{action}]]
 *
 * Methods:
 * - PUT    /{tenant}/{package}/blob/{key}          -> Upload blob
 * - GET    /{tenant}/{package}/blob/{key}          -> Download blob
 * - DELETE /{tenant}/{package}/blob/{key}          -> Delete blob
 * - HEAD   /{tenant}/{package}/blob/{key}          -> Check exists / get metadata
 * - GET    /{tenant}/{package}/blob                -> List blobs
 * - GET    /{tenant}/{package}/blob/{key}/presign  -> Get presigned URL
 * - POST   /{tenant}/{package}/blob/{key}/copy     -> Copy blob
 * - GET    /{tenant}/{package}/blob/_stats         -> Get storage stats
 */
class BlobRouteHandler {
public:
    explicit BlobRouteHandler(std::shared_ptr<BlobStorage> storage);

    /**
     * @brief Handle blob list and stats operations (no key in path)
     * GET -> List blobs (with optional prefix, continuationToken, maxKeys query params)
     */
    void handleBlobList(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package
    );

    /**
     * @brief Handle blob stats endpoint
     * GET /{tenant}/{package}/blob/_stats -> Storage statistics
     */
    void handleBlobStats(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package
    );

    /**
     * @brief Handle single blob CRUD operations
     * PUT    -> Upload blob
     * GET    -> Download blob (binary response)
     * DELETE -> Delete blob
     * HEAD   -> Check exists + get metadata headers
     */
    void handleBlobWithKey(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle blob actions (presign, copy)
     * GET  /{key}/presign -> Generate presigned URL
     * POST /{key}/copy    -> Copy blob to new key
     */
    void handleBlobAction(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key,
        const std::string& action
    );

private:
    /**
     * @brief Build tenant-isolated storage key
     * @param tenant Tenant identifier
     * @param package Package identifier
     * @param key User-provided blob key
     * @return Prefixed key: "{tenant}/{package}/{key}"
     */
    static std::string buildStorageKey(
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Strip the tenant/package prefix from a storage key
     * @param tenant Tenant identifier
     * @param package Package identifier
     * @param storage_key Full storage key with prefix
     * @return User-facing key without prefix
     */
    static std::string stripKeyPrefix(
        const std::string& tenant,
        const std::string& package,
        const std::string& storage_key
    );

    /**
     * @brief Convert BlobMetadata to JSON for API response
     * @param meta Blob metadata
     * @param tenant Tenant for key prefix stripping
     * @param package Package for key prefix stripping
     * @return JSON representation matching client expectations
     */
    static ::Json::Value metadataToJson(
        const BlobMetadata& meta,
        const std::string& tenant,
        const std::string& package
    );

    /**
     * @brief Convert ErrorCode to HTTP status code
     * @param code DBAL error code
     * @return Corresponding HTTP status code
     */
    static drogon::HttpStatusCode errorToHttpStatus(ErrorCode code);

    /**
     * @brief Send a structured JSON error response
     * @param callback Drogon response callback
     * @param code Error code string (e.g., "NOT_FOUND")
     * @param message Human-readable error message
     * @param status HTTP status code
     */
    static void sendBlobError(
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& code,
        const std::string& message,
        drogon::HttpStatusCode status
    );

    /**
     * @brief Send a structured JSON error response from a Result error
     * @param callback Drogon response callback
     * @param error DBAL error
     */
    static void sendBlobError(
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const Error& error
    );

    /**
     * @brief Handle upload (PUT) request
     */
    void handleUpload(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle download (GET) request
     */
    void handleDownload(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle delete (DELETE) request
     */
    void handleDelete(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle head (HEAD) request for metadata/exists
     */
    void handleHead(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle presign (GET /key/presign) request
     */
    void handlePresign(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    /**
     * @brief Handle copy (POST /key/copy) request
     */
    void handleCopy(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& key
    );

    std::shared_ptr<BlobStorage> storage_;
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
