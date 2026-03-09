#include "mongodb_type_converter.hpp"
#include "dbal/errors.hpp"
#include <bsoncxx/builder/stream/document.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::finalize;

bsoncxx::document::value MongoDBTypeConverter::jsonToBson(const Json& json) {
    // Use MongoDB C++ driver's JSON parsing
    // This handles nested objects, arrays, and all BSON types correctly
    return bsoncxx::from_json(json.dump());
}

Json MongoDBTypeConverter::bsonToJson(const bsoncxx::document::view& bson) {
    // Convert BSON to JSON string
    std::string jsonStr = bsoncxx::to_json(bson);

    // Parse JSON string to nlohmann::json
    return Json::parse(jsonStr);
}

bsoncxx::oid MongoDBTypeConverter::stringToObjectId(const std::string& id) {
    try {
        return bsoncxx::oid{id};
    } catch (const std::exception& e) {
        throw Error::validationError("Invalid ObjectId format: " + id);
    }
}

std::string MongoDBTypeConverter::objectIdToString(const bsoncxx::oid& oid) {
    return oid.to_string();
}

bsoncxx::document::value MongoDBTypeConverter::buildIdFilter(const std::string& id) {
    auto oid = stringToObjectId(id);
    return document{} << "_id" << oid << finalize;
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
