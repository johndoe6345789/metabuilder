/**
 * @file s3_http.hpp
 * @brief HTTP helper for S3 operations using cpr
 *
 * Wraps the cpr HTTP library to make signed S3 requests.
 * All requests are signed with AWS Signature V4 before sending.
 */

#pragma once

#include <string>
#include <map>
#include <vector>
#include <algorithm>
#include <cpr/cpr.h>
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_auth.hpp"

namespace dbal {
namespace blob {

/**
 * @struct S3Response
 * @brief Response from an S3 HTTP request
 */
struct S3Response {
    int status_code = 0;
    std::string body;
    std::map<std::string, std::string> headers;

    [[nodiscard]] bool is_success() const {
        return status_code >= 200 && status_code < 300;
    }

    [[nodiscard]] bool is_not_found() const {
        return status_code == 404;
    }

    /**
     * @brief Get a header value (case-insensitive lookup)
     */
    [[nodiscard]] std::string get_header(const std::string& name) const {
        // cpr normalizes header keys; try exact and lowercase
        auto it = headers.find(name);
        if (it != headers.end()) return it->second;

        // Try case-insensitive
        std::string lower_name = name;
        std::transform(lower_name.begin(), lower_name.end(), lower_name.begin(), ::tolower);
        for (const auto& [key, value] : headers) {
            std::string lower_key = key;
            std::transform(lower_key.begin(), lower_key.end(), lower_key.begin(), ::tolower);
            if (lower_key == lower_name) return value;
        }
        return "";
    }
};

/**
 * @brief Execute a signed S3 HTTP request
 *
 * Signs the request with AWS Signature V4 and sends it via cpr.
 *
 * @param config S3 configuration
 * @param method HTTP method (GET, PUT, DELETE, HEAD)
 * @param object_key Object key (e.g. "path/to/file.txt")
 * @param query_params Query string parameters
 * @param extra_headers Additional headers (e.g. x-amz-copy-source, Range)
 * @param body Request body
 * @return Result containing S3Response or error
 */
[[nodiscard]] inline Result<S3Response> s3_http_request(
    const S3Config& config,
    const std::string& method,
    const std::string& object_key,
    const std::map<std::string, std::string>& query_params = {},
    const std::map<std::string, std::string>& extra_headers = {},
    const std::string& body = ""
) {
    // Build the path for signing
    std::string path;
    if (config.use_path_style) {
        path = "/" + config.bucket;
        if (!object_key.empty()) {
            path += "/" + object_key;
        }
    } else {
        path = "/";
        if (!object_key.empty()) {
            path += object_key;
        }
    }

    // Build headers to sign
    std::map<std::string, std::string> headers_to_sign;
    headers_to_sign["host"] = config.buildHostHeader();

    // Add extra headers to signing set
    for (const auto& [key, value] : extra_headers) {
        std::string lower_key = key;
        std::transform(lower_key.begin(), lower_key.end(), lower_key.begin(), ::tolower);
        headers_to_sign[lower_key] = value;
    }

    // Sign the request
    auto signed_req = sign_request_v4(
        method, path, query_params, headers_to_sign,
        body, config.region, config.access_key, config.secret_key
    );

    // Build the full URL
    std::string url = config.buildBaseUrl();
    if (!object_key.empty()) {
        url += "/" + object_key;
    }

    // Add query string
    if (!query_params.empty()) {
        url += "?" + build_canonical_query_string(query_params);
    }

    // Convert signed headers to cpr::Header
    cpr::Header cpr_headers;
    for (const auto& [key, value] : signed_req.headers) {
        cpr_headers.insert({key, value});
    }

    // Execute the request
    cpr::Response response;
    const cpr::Url cpr_url{url};
    const cpr::Timeout timeout{30000};
    cpr::VerifySsl verify{config.use_ssl};

    if (method == "GET") {
        response = cpr::Get(cpr_url, cpr_headers, timeout, verify);
    } else if (method == "PUT") {
        response = cpr::Put(cpr_url, cpr_headers, cpr::Body{body}, timeout, verify);
    } else if (method == "DELETE") {
        response = cpr::Delete(cpr_url, cpr_headers, timeout, verify);
    } else if (method == "HEAD") {
        response = cpr::Head(cpr_url, cpr_headers, timeout, verify);
    } else {
        return Error::validationError("Unsupported HTTP method: " + method);
    }

    // Check for transport errors
    if (response.error) {
        return Error(ErrorCode::DatabaseError,
            "S3 HTTP request failed: " + response.error.message);
    }

    // Build response
    S3Response s3_resp;
    s3_resp.status_code = response.status_code;
    s3_resp.body = response.text;
    for (const auto& [key, value] : response.header) {
        s3_resp.headers[key] = value;
    }

    return Result<S3Response>(s3_resp);
}

/**
 * @brief Convert an unsuccessful S3 response to an appropriate Error
 * @param resp S3Response with non-2xx status
 * @param context Description of the operation for error message
 * @return Error with appropriate error code
 */
[[nodiscard]] inline Error s3_response_to_error(const S3Response& resp, const std::string& context) {
    if (resp.status_code == 404) {
        return Error::notFound(context + ": not found");
    }
    if (resp.status_code == 403) {
        return Error::forbidden(context + ": access denied");
    }
    if (resp.status_code == 401) {
        return Error::unauthorized(context + ": authentication failed");
    }
    if (resp.status_code == 409) {
        return Error::conflict(context + ": conflict");
    }
    if (resp.status_code == 412 || resp.status_code == 400) {
        return Error::validationError(context + ": " + resp.body);
    }
    return Error::internal(context + ": HTTP " + std::to_string(resp.status_code) + " " + resp.body);
}

} // namespace blob
} // namespace dbal
