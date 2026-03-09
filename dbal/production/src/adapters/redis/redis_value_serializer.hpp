#ifndef DBAL_REDIS_VALUE_SERIALIZER_HPP
#define DBAL_REDIS_VALUE_SERIALIZER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace redis {

using Json = nlohmann::json;

/**
 * Value Serializer - Converts between JSON and Redis string format
 *
 * Handles JSON serialization/deserialization for Redis storage
 * Provides error handling for malformed JSON
 * Supports JSON dump/parse operations
 */
class RedisValueSerializer {
public:
    /**
     * Serialize JSON object to Redis string format
     *
     * Example:
     *   serialize({"name": "Alice", "age": 30}) → "{\"name\":\"Alice\",\"age\":30}"
     */
    static std::string serialize(const Json& data);

    /**
     * Deserialize Redis string to JSON object
     * Returns error if JSON parsing fails
     *
     * Example:
     *   deserialize("{\"name\":\"Alice\"}") → {"name": "Alice"}
     */
    static Result<Json> deserialize(const std::string& data);

    /**
     * Check if string is valid JSON
     */
    static bool isValidJson(const std::string& data);

    /**
     * Serialize with pretty printing (for debugging)
     */
    static std::string serializePretty(const Json& data);
};

} // namespace redis
} // namespace adapters
} // namespace dbal

#endif // DBAL_REDIS_VALUE_SERIALIZER_HPP
