#ifndef DBAL_MONGODB_BULK_OPERATIONS_HPP
#define DBAL_MONGODB_BULK_OPERATIONS_HPP

#include <mongocxx/collection.hpp>
#include <nlohmann/json.hpp>
#include <vector>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace mongodb {

using Json = nlohmann::json;

/**
 * MongoDB Bulk Operations - Handles batch insert/update/delete operations
 *
 * Uses MongoDB's bulk_write API for efficient batch operations
 * Provides error handling and result counting
 */
class MongoDBBulkOperations {
public:
    /**
     * Insert multiple documents in one operation
     *
     * @param collection MongoDB collection handle
     * @param records Vector of JSON documents to insert
     * @return Result with count of inserted documents
     */
    static Result<int> insertMany(mongocxx::collection& collection,
                                  const std::vector<Json>& records);

    /**
     * Update multiple documents matching filter
     *
     * @param collection MongoDB collection handle
     * @param filter Query filter
     * @param data Fields to update
     * @return Result with count of modified documents
     */
    static Result<int> updateMany(mongocxx::collection& collection,
                                  const Json& filter,
                                  const Json& data);

    /**
     * Delete multiple documents matching filter
     *
     * @param collection MongoDB collection handle
     * @param filter Query filter
     * @return Result with count of deleted documents
     */
    static Result<int> deleteMany(mongocxx::collection& collection,
                                  const Json& filter);

private:
    // Disable instantiation (static utility class)
    MongoDBBulkOperations() = delete;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_BULK_OPERATIONS_HPP
