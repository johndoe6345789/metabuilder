#ifndef DBAL_MONGODB_TYPE_CONVERTER_HPP
#define DBAL_MONGODB_TYPE_CONVERTER_HPP

#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/document/value.hpp>
#include <bsoncxx/document/view.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/oid.hpp>
#include <nlohmann/json.hpp>
#include <string>

namespace dbal {
namespace adapters {
namespace mongodb {

using Json = nlohmann::json;

/**
 * MongoDB Type Converter - Static utilities for JSON ↔ BSON conversion
 *
 * Handles all type conversions between JSON and BSON formats
 * Manages MongoDB ObjectId conversions
 */
class MongoDBTypeConverter {
public:
    /**
     * Convert JSON object to BSON document
     *
     * Uses MongoDB C++ driver's JSON parsing for robust conversion
     * Handles nested objects, arrays, and all BSON types
     *
     * @param json JSON object
     * @return BSON document value
     */
    static bsoncxx::document::value jsonToBson(const Json& json);

    /**
     * Convert BSON document to JSON object
     *
     * Uses MongoDB C++ driver's JSON serialization
     *
     * @param bson BSON document view
     * @return JSON object
     */
    static Json bsonToJson(const bsoncxx::document::view& bson);

    /**
     * Convert string ID to MongoDB ObjectId
     *
     * @param id String representation (24 hex characters)
     * @return MongoDB ObjectId
     * @throws bsoncxx::exception if string is invalid
     */
    static bsoncxx::oid stringToObjectId(const std::string& id);

    /**
     * Convert MongoDB ObjectId to string
     *
     * @param oid ObjectId instance
     * @return 24-character hex string
     */
    static std::string objectIdToString(const bsoncxx::oid& oid);

    /**
     * Build BSON filter from ObjectId string
     *
     * Helper for building {_id: ObjectId(...)} filters
     *
     * @param id String ObjectId
     * @return BSON filter document
     */
    static bsoncxx::document::value buildIdFilter(const std::string& id);

private:
    // Disable instantiation (static utility class)
    MongoDBTypeConverter() = delete;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_TYPE_CONVERTER_HPP
