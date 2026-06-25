#include "mongodb_query_builder.hpp"
#include "mongodb_type_converter.hpp"
#include <bsoncxx/builder/stream/document.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::open_document;
using bsoncxx::builder::stream::close_document;
using bsoncxx::builder::stream::finalize;

bsoncxx::document::value MongoDBQueryBuilder::buildFilter(const Json& filter) {
    if (filter.empty()) {
        // Empty filter matches all documents
        return document{} << finalize;
    }

    // Convert JSON filter to BSON
    // This supports simple equality filters like {"tenantId": "acme", "status": "active"}
    // For complex queries (operators like $gt, $in, etc.), the JSON should already contain them
    return MongoDBTypeConverter::jsonToBson(filter);
}

bsoncxx::document::value MongoDBQueryBuilder::buildUpdate(const Json& data) {
    // Build MongoDB update document with $set operator
    document updateBuilder;
    updateBuilder << "$set" << open_document;

    for (auto it = data.begin(); it != data.end(); ++it) {
        const auto& key = it.key();
        const auto& value = it.value();

        // Convert JSON value to BSON
        if (value.is_string()) {
            updateBuilder << key << value.get<std::string>();
        } else if (value.is_number_integer()) {
            updateBuilder << key << value.get<int>();
        } else if (value.is_number_float()) {
            updateBuilder << key << value.get<double>();
        } else if (value.is_boolean()) {
            updateBuilder << key << value.get<bool>();
        } else if (value.is_null()) {
            updateBuilder << key << bsoncxx::types::b_null{};
        } else if (value.is_object() || value.is_array()) {
            // For complex types, convert to BSON via JSON string
            updateBuilder << key << bsoncxx::from_json(value.dump());
        }
    }

    updateBuilder << close_document;
    return updateBuilder << finalize;
}

bsoncxx::document::value MongoDBQueryBuilder::buildSort(const std::map<std::string, std::string>& sort) {
    document sortBuilder;

    for (const auto& [field, direction] : sort) {
        int sortDir = (direction == "desc" || direction == "DESC") ? -1 : 1;
        sortBuilder << field << sortDir;
    }

    return sortBuilder << finalize;
}

bsoncxx::document::value MongoDBQueryBuilder::buildUpsertUpdate(const Json& updateData,
                                                                const Json& createData) {
    document updateBuilder;

    // $set for update operations
    updateBuilder << "$set" << open_document;
    for (auto it = updateData.begin(); it != updateData.end(); ++it) {
        updateBuilder << it.key() << it.value().dump();
    }
    updateBuilder << close_document;

    // $setOnInsert for insert-only fields
    updateBuilder << "$setOnInsert" << open_document;
    for (auto it = createData.begin(); it != createData.end(); ++it) {
        updateBuilder << it.key() << it.value().dump();
    }
    updateBuilder << close_document;

    return updateBuilder << finalize;
}

int MongoDBQueryBuilder::calculateSkip(int page, int limit) {
    return page > 1 ? (page - 1) * limit : 0;
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
