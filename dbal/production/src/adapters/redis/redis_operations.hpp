#ifndef DBAL_REDIS_OPERATIONS_HPP
#define DBAL_REDIS_OPERATIONS_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/types.hpp"
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace redis {

using Json = nlohmann::json;

// Forward declarations
class RedisAdapter;

/**
 * Operations - Helper for bulk and query operations
 *
 * Implements:
 * - Bulk operations: createMany, updateMany, deleteMany
 * - Query operations: findFirst, findByField, upsert
 * - Filter matching logic
 */
class RedisOperations {
public:
    explicit RedisOperations(RedisAdapter& adapter);

    // Bulk operations
    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records);
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data);
    Result<int> deleteMany(const std::string& entityName, const Json& filter);

    // Query operations
    Result<Json> findFirst(const std::string& entityName, const Json& filter);
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value);
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField,
                       const Json& uniqueValue, const Json& createData, const Json& updateData);

    // Filter matching
    static bool matchesFilter(const Json& record, const Json& filter);

private:
    RedisAdapter& adapter_;
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_OPERATIONS_HPP
