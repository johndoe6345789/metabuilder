#include "elasticsearch_url_parser.hpp"
#include <sstream>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace elasticsearch {

ConnectionConfig ElasticsearchUrlParser::parse(const std::string& connection_url) {
    ConnectionConfig config;

    // Set defaults
    config.default_index = "metabuilder";
    config.document_type = "_doc";
    config.refresh_policy = "true";
    config.verify_certs = true;

    // Extract base URL
    config.base_url = extractBaseUrl(connection_url);

    // Parse query parameters
    parseQueryParams(connection_url, config);

    spdlog::debug("ElasticsearchUrlParser: base_url={}, index={}, type={}, refresh={}, verify_certs={}",
                 config.base_url, config.default_index, config.document_type,
                 config.refresh_policy, config.verify_certs);

    return config;
}

std::string ElasticsearchUrlParser::extractBaseUrl(const std::string& connection_url) {
    // Extract base URL (everything before '?')
    size_t query_pos = connection_url.find('?');
    std::string url_part = (query_pos != std::string::npos)
        ? connection_url.substr(0, query_pos)
        : connection_url;

    // Convert elasticsearch:// to http://
    if (url_part.find("elasticsearch://") == 0) {
        return "http://" + url_part.substr(16);
    }
    if (url_part.find("http://") == 0 || url_part.find("https://") == 0) {
        return url_part;
    }
    return "http://" + url_part;
}

void ElasticsearchUrlParser::parseQueryParams(const std::string& connection_url, ConnectionConfig& config) {
    size_t query_pos = connection_url.find('?');
    if (query_pos == std::string::npos || query_pos + 1 >= connection_url.length()) {
        return;
    }

    std::string query_string = connection_url.substr(query_pos + 1);
    std::istringstream query_stream(query_string);
    std::string param;

    while (std::getline(query_stream, param, '&')) {
        size_t eq_pos = param.find('=');
        if (eq_pos == std::string::npos) {
            continue;
        }

        std::string key = param.substr(0, eq_pos);
        std::string value = param.substr(eq_pos + 1);

        if (key == "index") {
            config.default_index = value;
        } else if (key == "type") {
            config.document_type = value;
        } else if (key == "refresh") {
            config.refresh_policy = value;
        } else if (key == "verify_certs") {
            config.verify_certs = (value == "true" || value == "1");
        }
    }
}

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal
