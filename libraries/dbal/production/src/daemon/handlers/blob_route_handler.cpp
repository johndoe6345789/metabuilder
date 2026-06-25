/**
 * @file blob_route_handler.cpp
 * @brief Implementation of RESTful blob storage route handlers
 */

#include "blob_route_handler.hpp"
#include "entity_route_handler_helpers.hpp"
#include <json/json.h>
#include <spdlog/spdlog.h>
#include <sstream>
#include <chrono>
#include <iomanip>

namespace dbal {
namespace daemon {
namespace handlers {

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

BlobRouteHandler::BlobRouteHandler(std::shared_ptr<BlobStorage> storage)
    : storage_(std::move(storage)) {}

// ---------------------------------------------------------------------------
// Static helpers
// ---------------------------------------------------------------------------

std::string BlobRouteHandler::buildStorageKey(
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    return tenant + "/" + package + "/" + key;
}

std::string BlobRouteHandler::stripKeyPrefix(
    const std::string& tenant,
    const std::string& package,
    const std::string& storage_key
) {
    std::string prefix = tenant + "/" + package + "/";
    if (storage_key.size() > prefix.size() &&
        storage_key.compare(0, prefix.size(), prefix) == 0) {
        return storage_key.substr(prefix.size());
    }
    return storage_key;
}

::Json::Value BlobRouteHandler::metadataToJson(
    const BlobMetadata& meta,
    const std::string& tenant,
    const std::string& package
) {
    ::Json::Value json;
    json["key"] = stripKeyPrefix(tenant, package, meta.key);
    json["size"] = static_cast<::Json::UInt64>(meta.size);
    json["contentType"] = meta.content_type;
    json["etag"] = meta.etag;

    // Format last_modified as ISO 8601 string
    auto time_t_val = std::chrono::system_clock::to_time_t(meta.last_modified);
    std::ostringstream oss;
    oss << std::put_time(std::gmtime(&time_t_val), "%Y-%m-%dT%H:%M:%SZ");
    json["lastModified"] = oss.str();

    if (!meta.custom_metadata.empty()) {
        ::Json::Value custom_meta;
        for (const auto& [k, v] : meta.custom_metadata) {
            custom_meta[k] = v;
        }
        json["customMetadata"] = custom_meta;
    }

    return json;
}

drogon::HttpStatusCode BlobRouteHandler::errorToHttpStatus(ErrorCode code) {
    switch (code) {
        case ErrorCode::NotFound:
            return drogon::HttpStatusCode::k404NotFound;
        case ErrorCode::Conflict:
            return drogon::HttpStatusCode::k409Conflict;
        case ErrorCode::Unauthorized:
            return drogon::HttpStatusCode::k401Unauthorized;
        case ErrorCode::Forbidden:
            return drogon::HttpStatusCode::k403Forbidden;
        case ErrorCode::ValidationError:
            return drogon::HttpStatusCode::k422UnprocessableEntity;
        case ErrorCode::RateLimitExceeded:
            return drogon::HttpStatusCode::k429TooManyRequests;
        case ErrorCode::CapabilityNotSupported:
            return drogon::HttpStatusCode::k501NotImplemented;
        case ErrorCode::Timeout:
            return drogon::HttpStatusCode::k504GatewayTimeout;
        case ErrorCode::DatabaseError:
            return drogon::HttpStatusCode::k503ServiceUnavailable;
        default:
            return drogon::HttpStatusCode::k500InternalServerError;
    }
}

void BlobRouteHandler::sendBlobError(
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& code,
    const std::string& message,
    drogon::HttpStatusCode status
) {
    ::Json::Value body;
    ::Json::Value error;
    error["code"] = code;
    error["message"] = message;
    body["error"] = error;

    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(status);
    callback(response);
}

void BlobRouteHandler::sendBlobError(
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const Error& error
) {
    std::string code_str;
    switch (error.code()) {
        case ErrorCode::NotFound:              code_str = "NOT_FOUND"; break;
        case ErrorCode::Conflict:              code_str = "CONFLICT"; break;
        case ErrorCode::Unauthorized:          code_str = "UNAUTHORIZED"; break;
        case ErrorCode::Forbidden:             code_str = "FORBIDDEN"; break;
        case ErrorCode::ValidationError:       code_str = "VALIDATION_ERROR"; break;
        case ErrorCode::RateLimitExceeded:     code_str = "RATE_LIMITED"; break;
        case ErrorCode::CapabilityNotSupported: code_str = "NOT_SUPPORTED"; break;
        case ErrorCode::Timeout:               code_str = "TIMEOUT"; break;
        case ErrorCode::DatabaseError:         code_str = "DATABASE_ERROR"; break;
        default:                               code_str = "INTERNAL_ERROR"; break;
    }

    sendBlobError(callback, code_str, error.what(), errorToHttpStatus(error.code()));
}

// ---------------------------------------------------------------------------
// handleBlobList — GET /{tenant}/{package}/blob
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleBlobList(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package
) {
    try {
        spdlog::trace("Blob list handler: /{}/{}/blob", tenant, package);

        auto query = parseQueryParameters(request);

        ListOptions options;
        // Prefix must be scoped to tenant/package for isolation
        std::string tenant_prefix = tenant + "/" + package + "/";

        if (query.count("prefix")) {
            options.prefix = tenant_prefix + query["prefix"];
        } else {
            options.prefix = tenant_prefix;
        }

        if (query.count("continuationToken")) {
            options.continuation_token = query["continuationToken"];
        }

        if (query.count("maxKeys")) {
            try {
                options.max_keys = std::stoull(query["maxKeys"]);
            } catch (...) {
                // Use default
            }
        }

        auto result = storage_->list(options);
        if (result.isError()) {
            spdlog::error("Blob list error: {}", result.error().what());
            sendBlobError(callback, result.error());
            return;
        }

        const auto& list_result = result.value();

        ::Json::Value items_json(::Json::arrayValue);
        for (const auto& item : list_result.items) {
            items_json.append(metadataToJson(item, tenant, package));
        }

        ::Json::Value body;
        body["items"] = items_json;
        body["isTruncated"] = list_result.is_truncated;
        if (list_result.next_token.has_value()) {
            body["nextToken"] = list_result.next_token.value();
        } else {
            body["nextToken"] = ::Json::nullValue;
        }

        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k200OK);
        callback(response);

    } catch (const std::exception& e) {
        spdlog::error("Blob list handler exception: {}", e.what());
        sendBlobError(callback, "INTERNAL_ERROR", "Internal server error",
                      drogon::HttpStatusCode::k500InternalServerError);
    }
}

// ---------------------------------------------------------------------------
// handleBlobStats — GET /{tenant}/{package}/blob/_stats
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleBlobStats(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package
) {
    try {
        spdlog::trace("Blob stats handler: /{}/{}/blob/_stats", tenant, package);

        auto size_result = storage_->getTotalSize();
        auto count_result = storage_->getObjectCount();

        if (size_result.isError()) {
            spdlog::error("Blob stats (size) error: {}", size_result.error().what());
            sendBlobError(callback, size_result.error());
            return;
        }

        if (count_result.isError()) {
            spdlog::error("Blob stats (count) error: {}", count_result.error().what());
            sendBlobError(callback, count_result.error());
            return;
        }

        ::Json::Value body;
        body["totalSize"] = static_cast<::Json::UInt64>(size_result.value());
        body["totalSizeBytes"] = static_cast<::Json::UInt64>(size_result.value());
        body["objectCount"] = static_cast<::Json::UInt64>(count_result.value());
        body["count"] = static_cast<::Json::UInt64>(count_result.value());

        auto response = drogon::HttpResponse::newHttpJsonResponse(body);
        response->setStatusCode(drogon::HttpStatusCode::k200OK);
        callback(response);

    } catch (const std::exception& e) {
        spdlog::error("Blob stats handler exception: {}", e.what());
        sendBlobError(callback, "INTERNAL_ERROR", "Internal server error",
                      drogon::HttpStatusCode::k500InternalServerError);
    }
}

// ---------------------------------------------------------------------------
// handleBlobWithKey — CRUD on /{tenant}/{package}/blob/{key}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleBlobWithKey(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    try {
        spdlog::trace("Blob key handler: /{}/{}/blob/{} method={}",
            tenant, package, key, request->getMethodString());

        switch (request->method()) {
            case drogon::HttpMethod::Put:
                handleUpload(request, callback, tenant, package, key);
                break;
            case drogon::HttpMethod::Get:
                handleDownload(request, callback, tenant, package, key);
                break;
            case drogon::HttpMethod::Delete:
                handleDelete(request, callback, tenant, package, key);
                break;
            case drogon::HttpMethod::Head:
                handleHead(request, callback, tenant, package, key);
                break;
            default:
                sendBlobError(callback, "METHOD_NOT_ALLOWED", "Method not allowed",
                              drogon::HttpStatusCode::k405MethodNotAllowed);
                break;
        }

    } catch (const std::exception& e) {
        spdlog::error("Blob key handler exception: {}", e.what());
        sendBlobError(callback, "INTERNAL_ERROR", "Internal server error",
                      drogon::HttpStatusCode::k500InternalServerError);
    }
}

// ---------------------------------------------------------------------------
// handleBlobAction — /{tenant}/{package}/blob/{key}/{action}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleBlobAction(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key,
    const std::string& action
) {
    try {
        spdlog::trace("Blob action handler: /{}/{}/blob/{}/{} method={}",
            tenant, package, key, action, request->getMethodString());

        if (action == "presign") {
            handlePresign(request, callback, tenant, package, key);
        } else if (action == "copy") {
            handleCopy(request, callback, tenant, package, key);
        } else {
            sendBlobError(callback, "NOT_FOUND", "Unknown blob action: " + action,
                          drogon::HttpStatusCode::k404NotFound);
        }

    } catch (const std::exception& e) {
        spdlog::error("Blob action handler exception: {}", e.what());
        sendBlobError(callback, "INTERNAL_ERROR", "Internal server error",
                      drogon::HttpStatusCode::k500InternalServerError);
    }
}

// ---------------------------------------------------------------------------
// Upload — PUT /{tenant}/{package}/blob/{key}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleUpload(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    std::string storage_key = buildStorageKey(tenant, package, key);

    // Read request body as binary data
    const auto& body_str = request->getBody();
    std::vector<char> data(body_str.begin(), body_str.end());

    // Build upload options from headers
    UploadOptions options;

    // Content-Type
    auto content_type = request->getHeader("Content-Type");
    if (!content_type.empty()) {
        options.content_type = content_type;
    } else {
        options.content_type = "application/octet-stream";
    }

    // X-Blob-Overwrite header
    auto overwrite_header = request->getHeader("X-Blob-Overwrite");
    if (!overwrite_header.empty()) {
        options.overwrite = (overwrite_header == "true" || overwrite_header == "1");
    }

    // X-Blob-Metadata header (JSON string of custom metadata)
    auto metadata_header = request->getHeader("X-Blob-Metadata");
    if (!metadata_header.empty()) {
        ::Json::Value meta_json;
        std::istringstream stream(metadata_header);
        ::Json::CharReaderBuilder reader;
        JSONCPP_STRING errs;
        if (::Json::parseFromStream(reader, stream, &meta_json, &errs) && errs.empty()) {
            for (const auto& member_name : meta_json.getMemberNames()) {
                options.metadata[member_name] = meta_json[member_name].asString();
            }
        } else {
            spdlog::warn("Failed to parse X-Blob-Metadata header: {}", errs);
        }
    }

    auto result = storage_->upload(storage_key, data, options);
    if (result.isError()) {
        spdlog::error("Blob upload error for key '{}': {}", key, result.error().what());
        sendBlobError(callback, result.error());
        return;
    }

    auto response_json = metadataToJson(result.value(), tenant, package);
    auto response = drogon::HttpResponse::newHttpJsonResponse(response_json);
    response->setStatusCode(drogon::HttpStatusCode::k201Created);
    callback(response);
}

// ---------------------------------------------------------------------------
// Download — GET /{tenant}/{package}/blob/{key}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleDownload(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    std::string storage_key = buildStorageKey(tenant, package, key);

    // Get metadata first for Content-Type header
    auto meta_result = storage_->getMetadata(storage_key);
    std::string content_type = "application/octet-stream";
    if (meta_result.isOk()) {
        content_type = meta_result.value().content_type;
    }

    auto result = storage_->download(storage_key);
    if (result.isError()) {
        spdlog::error("Blob download error for key '{}': {}", key, result.error().what());
        sendBlobError(callback, result.error());
        return;
    }

    const auto& data = result.value();

    auto response = drogon::HttpResponse::newHttpResponse();
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    response->setContentTypeString(content_type);
    response->setBody(std::string(data.begin(), data.end()));
    callback(response);
}

// ---------------------------------------------------------------------------
// Delete — DELETE /{tenant}/{package}/blob/{key}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleDelete(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    std::string storage_key = buildStorageKey(tenant, package, key);

    auto result = storage_->deleteBlob(storage_key);
    if (result.isError()) {
        spdlog::error("Blob delete error for key '{}': {}", key, result.error().what());
        sendBlobError(callback, result.error());
        return;
    }

    ::Json::Value body;
    body["success"] = true;
    body["deleted"] = true;

    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    callback(response);
}

// ---------------------------------------------------------------------------
// Head — HEAD /{tenant}/{package}/blob/{key}
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleHead(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    std::string storage_key = buildStorageKey(tenant, package, key);

    auto result = storage_->getMetadata(storage_key);
    if (result.isError()) {
        // For HEAD, return 404 with no body if not found
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(errorToHttpStatus(result.error().code()));
        callback(response);
        return;
    }

    const auto& meta = result.value();

    // Format last_modified as HTTP date
    auto time_t_val = std::chrono::system_clock::to_time_t(meta.last_modified);
    std::ostringstream date_oss;
    date_oss << std::put_time(std::gmtime(&time_t_val), "%a, %d %b %Y %H:%M:%S GMT");

    auto response = drogon::HttpResponse::newHttpResponse();
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    response->addHeader("Content-Length", std::to_string(meta.size));
    response->setContentTypeString(meta.content_type);
    response->addHeader("ETag", meta.etag);
    response->addHeader("Last-Modified", date_oss.str());

    // Custom metadata as JSON header
    if (!meta.custom_metadata.empty()) {
        ::Json::Value custom_json;
        for (const auto& [k, v] : meta.custom_metadata) {
            custom_json[k] = v;
        }
        ::Json::StreamWriterBuilder writer;
        writer["indentation"] = "";
        response->addHeader("X-Blob-Metadata", ::Json::writeString(writer, custom_json));
    }

    callback(response);
}

// ---------------------------------------------------------------------------
// Presign — GET /{tenant}/{package}/blob/{key}/presign
// ---------------------------------------------------------------------------

void BlobRouteHandler::handlePresign(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    std::string storage_key = buildStorageKey(tenant, package, key);

    auto query = parseQueryParameters(request);

    std::chrono::seconds expiration(3600); // Default 1 hour
    if (query.count("expires")) {
        try {
            expiration = std::chrono::seconds(std::stol(query["expires"]));
        } catch (...) {
            // Use default
        }
    }

    auto result = storage_->generatePresignedUrl(storage_key, expiration);
    if (result.isError()) {
        spdlog::error("Blob presign error for key '{}': {}", key, result.error().what());
        sendBlobError(callback, result.error());
        return;
    }

    ::Json::Value body;
    body["url"] = result.value();
    body["presignedUrl"] = result.value();

    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    callback(response);
}

// ---------------------------------------------------------------------------
// Copy — POST /{tenant}/{package}/blob/{key}/copy
// ---------------------------------------------------------------------------

void BlobRouteHandler::handleCopy(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback,
    const std::string& tenant,
    const std::string& package,
    const std::string& key
) {
    // Parse JSON body for destKey
    std::string body_str(request->getBody());
    ::Json::Value body;
    {
        std::istringstream stream(body_str);
        ::Json::CharReaderBuilder reader;
        JSONCPP_STRING errs;
        if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
            sendBlobError(callback, "VALIDATION_ERROR", "Invalid JSON body",
                          drogon::HttpStatusCode::k422UnprocessableEntity);
            return;
        }
    }

    if (!body.isMember("destKey") || !body["destKey"].isString()) {
        sendBlobError(callback, "VALIDATION_ERROR", "Missing required field: destKey",
                      drogon::HttpStatusCode::k422UnprocessableEntity);
        return;
    }

    std::string dest_key_raw = body["destKey"].asString();
    if (dest_key_raw.empty()) {
        sendBlobError(callback, "VALIDATION_ERROR", "destKey must not be empty",
                      drogon::HttpStatusCode::k422UnprocessableEntity);
        return;
    }

    std::string source_storage_key = buildStorageKey(tenant, package, key);
    std::string dest_storage_key = buildStorageKey(tenant, package, dest_key_raw);

    auto result = storage_->copy(source_storage_key, dest_storage_key);
    if (result.isError()) {
        spdlog::error("Blob copy error from '{}' to '{}': {}",
            key, dest_key_raw, result.error().what());
        sendBlobError(callback, result.error());
        return;
    }

    auto response_json = metadataToJson(result.value(), tenant, package);
    auto response = drogon::HttpResponse::newHttpJsonResponse(response_json);
    response->setStatusCode(drogon::HttpStatusCode::k200OK);
    callback(response);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
