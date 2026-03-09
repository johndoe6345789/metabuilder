/**
 * @file s3_auth.hpp
 * @brief AWS Signature V4 signing for S3-compatible APIs
 *
 * Implements the complete AWS Signature Version 4 signing process:
 * 1. Create canonical request
 * 2. Create string to sign
 * 3. Calculate signing key (HMAC chain)
 * 4. Calculate signature
 * 5. Build Authorization header
 *
 * Uses OpenSSL for HMAC-SHA256 and SHA256 hashing.
 */

#pragma once

#include <string>
#include <map>
#include <vector>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <ctime>
#include <chrono>
#include <cstring>
#include <openssl/hmac.h>
#include <openssl/sha.h>

namespace dbal {
namespace blob {

/**
 * @brief Compute SHA256 hash of data and return hex-encoded string
 * @param data Input bytes
 * @param len Length of input
 * @return Lowercase hex-encoded SHA256 hash
 */
[[nodiscard]] inline std::string sha256_hex(const char* data, size_t len) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(data), len, hash);

    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (int i = 0; i < SHA256_DIGEST_LENGTH; ++i) {
        oss << std::setw(2) << static_cast<unsigned>(hash[i]);
    }
    return oss.str();
}

/**
 * @brief Compute SHA256 hash of a string
 */
[[nodiscard]] inline std::string sha256_hex(const std::string& data) {
    return sha256_hex(data.data(), data.size());
}

/**
 * @brief Compute HMAC-SHA256 and return raw bytes
 * @param key HMAC key bytes
 * @param key_len Length of key
 * @param data Input data
 * @param data_len Length of input data
 * @return Raw HMAC-SHA256 bytes (32 bytes)
 */
[[nodiscard]] inline std::vector<unsigned char> hmac_sha256_raw(
    const unsigned char* key, size_t key_len,
    const unsigned char* data, size_t data_len
) {
    std::vector<unsigned char> result(SHA256_DIGEST_LENGTH);
    unsigned int len = SHA256_DIGEST_LENGTH;
    HMAC(EVP_sha256(), key, static_cast<int>(key_len),
         data, data_len, result.data(), &len);
    return result;
}

/**
 * @brief Compute HMAC-SHA256 with string key and data, return raw bytes
 */
[[nodiscard]] inline std::vector<unsigned char> hmac_sha256_raw(
    const std::vector<unsigned char>& key,
    const std::string& data
) {
    return hmac_sha256_raw(
        key.data(), key.size(),
        reinterpret_cast<const unsigned char*>(data.data()), data.size()
    );
}

/**
 * @brief Compute HMAC-SHA256 with string key and data, return raw bytes
 */
[[nodiscard]] inline std::vector<unsigned char> hmac_sha256_raw(
    const std::string& key,
    const std::string& data
) {
    return hmac_sha256_raw(
        reinterpret_cast<const unsigned char*>(key.data()), key.size(),
        reinterpret_cast<const unsigned char*>(data.data()), data.size()
    );
}

/**
 * @brief Convert raw bytes to lowercase hex string
 */
[[nodiscard]] inline std::string to_hex(const std::vector<unsigned char>& bytes) {
    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    for (auto b : bytes) {
        oss << std::setw(2) << static_cast<unsigned>(b);
    }
    return oss.str();
}

/**
 * @brief URL-encode a string per RFC 3986
 * @param str Input string
 * @param encode_slash Whether to encode '/' characters
 * @return URL-encoded string
 */
[[nodiscard]] inline std::string uri_encode(const std::string& str, bool encode_slash = true) {
    std::ostringstream encoded;
    encoded << std::hex << std::uppercase << std::setfill('0');

    for (unsigned char c : str) {
        if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
            (c >= '0' && c <= '9') || c == '_' || c == '-' || c == '~' || c == '.') {
            encoded << c;
        } else if (c == '/' && !encode_slash) {
            encoded << '/';
        } else {
            encoded << '%' << std::setw(2) << static_cast<unsigned>(c);
        }
    }
    return encoded.str();
}

/**
 * @brief Get current UTC time formatted for AWS
 * @param[out] date_stamp YYYYMMDD format
 * @param[out] amz_date ISO 8601 basic format (YYYYMMDDTHHmmSSZ)
 */
inline void get_aws_timestamps(std::string& date_stamp, std::string& amz_date) {
    std::time_t now = std::time(nullptr);
    std::tm utc{};
#ifdef _WIN32
    gmtime_s(&utc, &now);
#else
    gmtime_r(&now, &utc);
#endif
    char date_buf[16];
    char amz_buf[32];
    std::strftime(date_buf, sizeof(date_buf), "%Y%m%d", &utc);
    std::strftime(amz_buf, sizeof(amz_buf), "%Y%m%dT%H%M%SZ", &utc);
    date_stamp = date_buf;
    amz_date = amz_buf;
}

/**
 * @brief Format a specific time_point for AWS timestamps
 */
inline void get_aws_timestamps(
    std::chrono::system_clock::time_point tp,
    std::string& date_stamp,
    std::string& amz_date
) {
    std::time_t tt = std::chrono::system_clock::to_time_t(tp);
    std::tm utc{};
#ifdef _WIN32
    gmtime_s(&utc, &tt);
#else
    gmtime_r(&tt, &utc);
#endif
    char date_buf[16];
    char amz_buf[32];
    std::strftime(date_buf, sizeof(date_buf), "%Y%m%d", &utc);
    std::strftime(amz_buf, sizeof(amz_buf), "%Y%m%dT%H%M%SZ", &utc);
    date_stamp = date_buf;
    amz_date = amz_buf;
}

/**
 * @struct SignedRequest
 * @brief Result of signing an S3 request
 */
struct SignedRequest {
    std::map<std::string, std::string> headers;  ///< All headers to send (including Authorization)
    std::string authorization;                     ///< Authorization header value
    std::string amz_date;                         ///< X-Amz-Date header value
    std::string content_sha256;                   ///< X-Amz-Content-Sha256 header value
};

/**
 * @brief Build the canonical query string from parameters
 * @param params Query parameters (key-value pairs)
 * @return URL-encoded canonical query string
 */
[[nodiscard]] inline std::string build_canonical_query_string(
    const std::map<std::string, std::string>& params
) {
    if (params.empty()) return "";

    std::ostringstream qs;
    bool first = true;
    for (const auto& [key, value] : params) {
        if (!first) qs << '&';
        qs << uri_encode(key, true) << '=' << uri_encode(value, true);
        first = false;
    }
    return qs.str();
}

/**
 * @brief Sign an S3 request using AWS Signature V4
 *
 * This is the core signing function implementing the full AWS SigV4 flow:
 * 1. Create canonical request
 * 2. Create string to sign
 * 3. Derive signing key via HMAC chain
 * 4. Calculate signature
 * 5. Build Authorization header
 *
 * @param method HTTP method (GET, PUT, DELETE, HEAD)
 * @param path URL path (e.g. "/bucket/key")
 * @param query_params Query string parameters (sorted)
 * @param headers_to_sign Headers to include in signature
 * @param payload Request body (empty string for no body)
 * @param region AWS region
 * @param access_key AWS access key
 * @param secret_key AWS secret key
 * @param service AWS service name (default "s3")
 * @return SignedRequest with all necessary headers
 */
[[nodiscard]] inline SignedRequest sign_request_v4(
    const std::string& method,
    const std::string& path,
    const std::map<std::string, std::string>& query_params,
    const std::map<std::string, std::string>& headers_to_sign,
    const std::string& payload,
    const std::string& region,
    const std::string& access_key,
    const std::string& secret_key,
    const std::string& service = "s3"
) {
    // Step 0: Get timestamps
    std::string date_stamp;
    std::string amz_date;
    get_aws_timestamps(date_stamp, amz_date);

    // Step 0b: Compute payload hash
    std::string payload_hash = sha256_hex(payload);

    // Build the full set of headers (add amz-date and content-sha256)
    std::map<std::string, std::string> all_headers = headers_to_sign;
    all_headers["x-amz-date"] = amz_date;
    all_headers["x-amz-content-sha256"] = payload_hash;

    // Step 1: Create canonical request
    // CanonicalRequest =
    //   HTTPRequestMethod + '\n' +
    //   CanonicalURI + '\n' +
    //   CanonicalQueryString + '\n' +
    //   CanonicalHeaders + '\n' +
    //   SignedHeaders + '\n' +
    //   HexEncode(Hash(Payload))

    // 1a: Canonical URI (path-encoded, but don't encode '/')
    std::string canonical_uri = uri_encode(path, false);
    if (canonical_uri.empty()) {
        canonical_uri = "/";
    }

    // 1b: Canonical query string
    std::string canonical_query_string = build_canonical_query_string(query_params);

    // 1c: Canonical headers (lowercase, sorted, trimmed)
    std::ostringstream canonical_headers_stream;
    std::ostringstream signed_headers_stream;
    bool first = true;
    for (const auto& [key, value] : all_headers) {
        // Headers are already in a sorted map (std::map sorts by key)
        std::string lower_key = key;
        std::transform(lower_key.begin(), lower_key.end(), lower_key.begin(), ::tolower);

        // Trim whitespace
        std::string trimmed_value = value;
        auto start = trimmed_value.find_first_not_of(" \t");
        auto end = trimmed_value.find_last_not_of(" \t");
        if (start != std::string::npos) {
            trimmed_value = trimmed_value.substr(start, end - start + 1);
        }

        canonical_headers_stream << lower_key << ':' << trimmed_value << '\n';
        if (!first) signed_headers_stream << ';';
        signed_headers_stream << lower_key;
        first = false;
    }
    std::string canonical_headers = canonical_headers_stream.str();
    std::string signed_headers = signed_headers_stream.str();

    // 1d: Build canonical request
    std::string canonical_request =
        method + "\n" +
        canonical_uri + "\n" +
        canonical_query_string + "\n" +
        canonical_headers + "\n" +
        signed_headers + "\n" +
        payload_hash;

    // Step 2: Create string to sign
    // StringToSign =
    //   Algorithm + '\n' +
    //   RequestDateTime + '\n' +
    //   CredentialScope + '\n' +
    //   HexEncode(Hash(CanonicalRequest))
    std::string algorithm = "AWS4-HMAC-SHA256";
    std::string credential_scope = date_stamp + "/" + region + "/" + service + "/aws4_request";
    std::string string_to_sign =
        algorithm + "\n" +
        amz_date + "\n" +
        credential_scope + "\n" +
        sha256_hex(canonical_request);

    // Step 3: Calculate signing key
    // kDate    = HMAC("AWS4" + secret_key, date_stamp)
    // kRegion  = HMAC(kDate, region)
    // kService = HMAC(kRegion, service)
    // kSigning = HMAC(kService, "aws4_request")
    std::string k_secret = "AWS4" + secret_key;
    auto k_date = hmac_sha256_raw(k_secret, date_stamp);
    auto k_region = hmac_sha256_raw(k_date, region);
    auto k_service = hmac_sha256_raw(k_region, service);
    auto k_signing = hmac_sha256_raw(k_service, std::string("aws4_request"));

    // Step 4: Calculate signature
    auto signature_raw = hmac_sha256_raw(k_signing, string_to_sign);
    std::string signature = to_hex(signature_raw);

    // Step 5: Build Authorization header
    std::string authorization =
        algorithm + " " +
        "Credential=" + access_key + "/" + credential_scope + ", " +
        "SignedHeaders=" + signed_headers + ", " +
        "Signature=" + signature;

    SignedRequest result;
    result.headers = all_headers;
    result.headers["Authorization"] = authorization;
    result.authorization = authorization;
    result.amz_date = amz_date;
    result.content_sha256 = payload_hash;

    return result;
}

/**
 * @brief Generate a presigned URL with query string authentication
 *
 * Creates a URL with embedded authentication that can be shared for
 * temporary access to an S3 object without requiring credentials.
 *
 * @param method HTTP method (typically GET)
 * @param host Host header value
 * @param path URL path
 * @param region AWS region
 * @param access_key AWS access key
 * @param secret_key AWS secret key
 * @param expires_seconds URL validity duration in seconds
 * @param service AWS service (default "s3")
 * @return Presigned query string (without leading '?')
 */
[[nodiscard]] inline std::string generate_presigned_query_string(
    const std::string& method,
    const std::string& host,
    const std::string& path,
    const std::string& region,
    const std::string& access_key,
    const std::string& secret_key,
    int expires_seconds = 3600,
    const std::string& service = "s3"
) {
    std::string date_stamp;
    std::string amz_date;
    get_aws_timestamps(date_stamp, amz_date);

    std::string credential_scope = date_stamp + "/" + region + "/" + service + "/aws4_request";
    std::string credential = access_key + "/" + credential_scope;

    // Build query parameters for presigned URL
    std::map<std::string, std::string> query_params;
    query_params["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256";
    query_params["X-Amz-Credential"] = credential;
    query_params["X-Amz-Date"] = amz_date;
    query_params["X-Amz-Expires"] = std::to_string(expires_seconds);
    query_params["X-Amz-SignedHeaders"] = "host";

    std::string canonical_query_string = build_canonical_query_string(query_params);

    // Canonical headers (only host for presigned)
    std::string canonical_headers = "host:" + host + "\n";
    std::string signed_headers = "host";

    // Presigned URLs use UNSIGNED-PAYLOAD
    std::string payload_hash = "UNSIGNED-PAYLOAD";

    // Canonical URI
    std::string canonical_uri = uri_encode(path, false);
    if (canonical_uri.empty()) {
        canonical_uri = "/";
    }

    // Build canonical request
    std::string canonical_request =
        method + "\n" +
        canonical_uri + "\n" +
        canonical_query_string + "\n" +
        canonical_headers + "\n" +
        signed_headers + "\n" +
        payload_hash;

    // String to sign
    std::string string_to_sign =
        "AWS4-HMAC-SHA256\n" +
        amz_date + "\n" +
        credential_scope + "\n" +
        sha256_hex(canonical_request);

    // Signing key
    std::string k_secret = "AWS4" + secret_key;
    auto k_date = hmac_sha256_raw(k_secret, date_stamp);
    auto k_region = hmac_sha256_raw(k_date, region);
    auto k_service = hmac_sha256_raw(k_region, service);
    auto k_signing = hmac_sha256_raw(k_service, std::string("aws4_request"));

    // Signature
    auto signature_raw = hmac_sha256_raw(k_signing, string_to_sign);
    std::string signature = to_hex(signature_raw);

    // Return the full query string
    return canonical_query_string + "&X-Amz-Signature=" + signature;
}

} // namespace blob
} // namespace dbal
