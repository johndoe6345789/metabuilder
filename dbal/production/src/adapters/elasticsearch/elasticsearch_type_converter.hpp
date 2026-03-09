#ifndef DBAL_ELASTICSEARCH_TYPE_CONVERTER_HPP
#define DBAL_ELASTICSEARCH_TYPE_CONVERTER_HPP

#include <string>
#include <nlohmann/json.hpp>

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

/**
 * Type Converter - Maps DBAL types to Elasticsearch field types
 *
 * Converts between:
 * - DBAL schema types → Elasticsearch mapping types
 * - Entity names → Index names (lowercase)
 * - Document paths (/{index}/_doc/{id})
 */
class ElasticsearchTypeConverter {
public:
    /**
     * Convert DBAL type to Elasticsearch field type
     *
     * Examples:
     *   "string" → "text" with "keyword" multi-field
     *   "number" → "double"
     *   "boolean" → "boolean"
     *   "timestamp" → "date"
     *   "json" → "object"
     */
    static Json convertFieldType(const std::string& dbal_type);

    /**
     * Convert entity name to index name (lowercase)
     */
    static std::string toIndexName(const std::string& entity_name);

    /**
     * Build document path: /{index}/_doc/{id}
     */
    static std::string makeDocumentPath(const std::string& index_name, const std::string& document_type,
                                        const std::string& id = "");

    /**
     * Build search path: /{index}/_search
     */
    static std::string makeSearchPath(const std::string& index_name);

    /**
     * Generate UUID for new document
     */
    static std::string generateId();
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_TYPE_CONVERTER_HPP
