/**
 * @file s3_config.hpp
 * @brief Configuration for S3-compatible blob storage
 */

#pragma once

#include <string>

namespace dbal {
namespace blob {

/**
 * @struct S3Config
 * @brief Configuration for connecting to S3-compatible storage
 *
 * Supports AWS S3, MinIO, Garage, and any S3-compatible API.
 * Path-style addressing is used by default for MinIO compatibility.
 */
struct S3Config {
    std::string endpoint;        ///< e.g. "http://localhost:9000" or "https://s3.amazonaws.com"
    std::string bucket;          ///< Bucket name
    std::string region;          ///< e.g. "us-east-1"
    std::string access_key;      ///< AWS access key ID
    std::string secret_key;      ///< AWS secret access key
    bool use_path_style = true;  ///< MinIO needs path-style, AWS uses virtual-hosted
    bool use_ssl = false;        ///< Derived from endpoint (https = true)

    /**
     * @brief Derive use_ssl from endpoint scheme
     */
    void detectSsl() {
        use_ssl = (endpoint.find("https://") == 0);
    }

    /**
     * @brief Build the base URL for S3 requests
     * @return Base URL string (path-style or virtual-hosted)
     *
     * Path-style:          http://host:port/bucket
     * Virtual-hosted-style: http://bucket.host:port
     */
    [[nodiscard]] std::string buildBaseUrl() const {
        if (use_path_style) {
            return endpoint + "/" + bucket;
        }
        // Virtual-hosted: insert bucket as subdomain
        std::string scheme;
        std::string host;
        auto pos = endpoint.find("://");
        if (pos != std::string::npos) {
            scheme = endpoint.substr(0, pos + 3);
            host = endpoint.substr(pos + 3);
        } else {
            scheme = "https://";
            host = endpoint;
        }
        return scheme + bucket + "." + host;
    }

    /**
     * @brief Extract host from endpoint (without scheme)
     * @return Host string
     */
    [[nodiscard]] std::string getHost() const {
        auto pos = endpoint.find("://");
        if (pos != std::string::npos) {
            return endpoint.substr(pos + 3);
        }
        return endpoint;
    }

    /**
     * @brief Build the Host header value for S3 requests
     * @return Host header value
     */
    [[nodiscard]] std::string buildHostHeader() const {
        if (use_path_style) {
            return getHost();
        }
        return bucket + "." + getHost();
    }
};

} // namespace blob
} // namespace dbal
