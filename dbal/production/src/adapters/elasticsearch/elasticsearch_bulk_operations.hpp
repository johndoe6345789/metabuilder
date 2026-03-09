#ifndef DBAL_ELASTICSEARCH_BULK_OPERATIONS_HPP
#define DBAL_ELASTICSEARCH_BULK_OPERATIONS_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace dbal {
namespace adapters {
namespace elasticsearch {

using Json = nlohmann::json;

/**
 * Bulk Operations - Constructs NDJSON for Elasticsearch bulk API
 *
 * Builds bulk requests for:
 * - Index operations (create/update with ID)
 * - Update operations (partial document update)
 * - Delete operations (remove by ID)
 *
 * Format: Each operation is 2 lines (action + document)
 * { "index": { "_index": "users", "_id": "123" } }
 * { "name": "Alice", "age": 30 }
 */
class ElasticsearchBulkOperations {
public:
    /**
     * Build bulk index operations (create/update)
     *
     * Returns vector of NDJSON lines (2 lines per record)
     */
    static std::vector<std::string> buildIndexOperations(const std::string& index_name,
                                                          const std::vector<Json>& records);

    /**
     * Build bulk update operations (partial updates)
     *
     * Returns vector of NDJSON lines (2 lines per record)
     */
    static std::vector<std::string> buildUpdateOperations(const std::string& index_name,
                                                           const std::vector<Json>& records,
                                                           const Json& update_data);

    /**
     * Build bulk delete operations
     *
     * Returns vector of NDJSON lines (1 line per record)
     */
    static std::vector<std::string> buildDeleteOperations(const std::string& index_name,
                                                           const std::vector<Json>& records);

    /**
     * Parse bulk response and count successes
     */
    static int countSuccesses(const Json& bulk_response, const std::string& operation_type);
};

} // namespace elasticsearch
} // namespace adapters
} // namespace dbal

#endif // DBAL_ELASTICSEARCH_BULK_OPERATIONS_HPP
