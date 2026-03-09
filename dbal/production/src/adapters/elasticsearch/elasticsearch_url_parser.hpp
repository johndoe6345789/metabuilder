#ifndef DBAL_ELASTICSEARCH_URL_PARSER_HPP
#define DBAL_ELASTICSEARCH_URL_PARSER_HPP

#include <string>

namespace dbal {
namespace adapters {
namespace elasticsearch {

/**
 * URL Parser - Parses Elasticsearch connection URL and query parameters
 *
 * Format: elasticsearch://host:port?index=default&type=_doc&refresh=true&verify_certs=true
 *
 * Query parameters:
 * - index: Default index name (default: "metabuilder")
 * - type: Document type (default: "_doc")
 * - refresh: Refresh policy - "true", "false", "wait_for"
 * - verify_certs: SSL certificate verification (default: true)
 */
struct ConnectionConfig {
    std::string base_url;
    std::string default_index;
    std::string document_type;
    std::string refresh_policy;
    bool verify_certs;
};

class ElasticsearchUrlParser {
public:
    /**
     * Parse connection URL into configuration
     */
    static ConnectionConfig parse(const std::string& connection_url);

private:
    static std::string extractBaseUrl(const std::string& connection_url);
    static void parseQueryParams(const std::string& connection_url, ConnectionConfig& config);
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_URL_PARSER_HPP
