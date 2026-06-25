#ifndef DBAL_MONGODB_QUERY_BUILDER_HPP
#define DBAL_MONGODB_QUERY_BUILDER_HPP

#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/document/value.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include "dbal/types.hpp"

namespace dbal {
namespace adapters {
namespace mongodb {

using Json = nlohmann::json;

/**
 * MongoDB Query Builder - Static utilities for constructing BSON queries
 *
 * Builds MongoDB queries, filters, and updates in BSON format
 * Handles:
 * - Filter documents for find/delete operations
 * - Update documents with $set operator
 * - Sort specifications
 * - Pagination (limit/skip)
 */
class MongoDBQueryBuilder {
public:
    /**
     * Build MongoDB filter document from JSON filter
     *
     * Examples:
     *   buildFilter({}) → {}
     *   buildFilter({"status": "active"}) → {status: "active"}
     *   buildFilter({"age": {"$gt": 18}}) → {age: {$gt: 18}}
     *
     * @param filter JSON filter object
     * @return BSON filter document
     */
    static bsoncxx::document::value buildFilter(const Json& filter);

    /**
     * Build MongoDB update document with $set operator
     *
     * Example:
     *   buildUpdate({"name": "Alice", "age": 30})
     *   → {$set: {name: "Alice", age: 30}}
     *
     * @param data JSON fields to update
     * @return BSON update document
     */
    static bsoncxx::document::value buildUpdate(const Json& data);

    /**
     * Build MongoDB sort document from sort map
     *
     * Example:
     *   buildSort({{"name", "asc"}, {"age", "desc"}})
     *   → {name: 1, age: -1}
     *
     * @param sort Map of field names to sort directions
     * @return BSON sort document
     */
    static bsoncxx::document::value buildSort(const std::map<std::string, std::string>& sort);

    /**
     * Build MongoDB upsert update document
     *
     * Combines $set for updates and $setOnInsert for new documents
     *
     * @param updateData Fields to update
     * @param createData Fields to set only on insert
     * @return BSON update document
     */
    static bsoncxx::document::value buildUpsertUpdate(const Json& updateData,
                                                      const Json& createData);

    /**
     * Calculate skip value from page number and limit
     *
     * @param page Page number (1-indexed)
     * @param limit Items per page
     * @return Skip/offset value
     */
    static int calculateSkip(int page, int limit);

private:
    // Disable instantiation (static utility class)
    MongoDBQueryBuilder() = delete;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_QUERY_BUILDER_HPP
