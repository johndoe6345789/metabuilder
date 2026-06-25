#include "mongodb_bulk_operations.hpp"
#include "mongodb_type_converter.hpp"
#include "mongodb_query_builder.hpp"
#include "mongodb_result_parser.hpp"
#include <spdlog/spdlog.h>
#include <bsoncxx/exception/exception.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

Result<int> MongoDBBulkOperations::insertMany(mongocxx::collection& collection,
                                              const std::vector<Json>& records) {
    try {
        // Convert JSON array to BSON documents
        std::vector<bsoncxx::document::value> bsonDocs;
        bsonDocs.reserve(records.size());

        for (const auto& record : records) {
            bsonDocs.push_back(MongoDBTypeConverter::jsonToBson(record));
        }

        // Insert many documents
        auto result = collection.insert_many(bsonDocs);

        if (!result) {
            return Error::internal("MongoDB insert_many operation failed");
        }

        return Result<int>(MongoDBResultParser::parseInsertManyResult(*result));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB insertMany error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in insertMany: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<int> MongoDBBulkOperations::updateMany(mongocxx::collection& collection,
                                              const Json& filter,
                                              const Json& data) {
    try {
        // Build filter and update documents
        auto filterDoc = MongoDBQueryBuilder::buildFilter(filter);
        auto updateDoc = MongoDBQueryBuilder::buildUpdate(data);

        // Update many documents
        auto result = collection.update_many(filterDoc.view(), updateDoc.view());

        if (!result) {
            return Error::internal("MongoDB update_many operation failed");
        }

        return Result<int>(MongoDBResultParser::parseUpdateResult(*result));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB updateMany error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in updateMany: {}", e.what());
        return Error::internal(e.what());
    }
}

Result<int> MongoDBBulkOperations::deleteMany(mongocxx::collection& collection,
                                              const Json& filter) {
    try {
        // Build filter document
        auto filterDoc = MongoDBQueryBuilder::buildFilter(filter);

        // Delete many documents
        auto result = collection.delete_many(filterDoc.view());

        if (!result) {
            return Error::internal("MongoDB delete_many operation failed");
        }

        return Result<int>(MongoDBResultParser::parseDeleteResult(*result));

    } catch (const bsoncxx::exception& e) {
        spdlog::error("MongoDB deleteMany error: {}", e.what());
        return Error::internal(std::string("MongoDB error: ") + e.what());
    } catch (const std::exception& e) {
        spdlog::error("Unexpected error in deleteMany: {}", e.what());
        return Error::internal(e.what());
    }
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
