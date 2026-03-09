#ifndef DBAL_ELASTICSEARCH_HTTP_CLIENT_HPP
#define DBAL_ELASTICSEARCH_HTTP_CLIENT_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

/**
 * HTTP Client - Wraps cpr library for Elasticsearch REST API calls
 *
 * Handles all HTTP communication with Elasticsearch
 * Supports GET, POST, PUT, DELETE, HEAD methods
 * Manages SSL verification and refresh policy
 * Parses JSON responses and handles errors
 */
class ElasticsearchHttpClient {
public:
    ElasticsearchHttpClient(std::string base_url, std::string refresh_policy, bool verify_certs);

    /**
     * Execute HTTP GET request
     */
    Result<Json> get(const std::string& path);

    /**
     * Execute HTTP HEAD request (check existence)
     */
    Result<Json> head(const std::string& path);

    /**
     * Execute HTTP POST request
     */
    Result<Json> post(const std::string& path, const Json& body, bool include_refresh = false);

    /**
     * Execute HTTP PUT request
     */
    Result<Json> put(const std::string& path, const Json& body, bool include_refresh = false);

    /**
     * Execute HTTP DELETE request
     */
    Result<Json> deleteRequest(const std::string& path, bool include_refresh = false);

    /**
     * Execute bulk request (NDJSON format)
     */
    Result<Json> bulk(const std::vector<std::string>& ndjson_lines);

private:
    std::string buildUrl(const std::string& path, bool include_refresh) const;

    std::string base_url_;
    std::string refresh_policy_;
    bool verify_certs_;
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_HTTP_CLIENT_HPP
