#include "mongodb_result_parser.hpp"
#include "mongodb_type_converter.hpp"
#include <bsoncxx/types.hpp>

namespace dbal {
namespace adapters {
namespace mongodb {

Json MongoDBResultParser::parseInsertResult(const mongocxx::result::insert_one& result,
                                            const Json& originalData) {
    Json resultJson = originalData;

    // Add inserted _id to result
    if (result.inserted_id().type() == bsoncxx::type::k_oid) {
        resultJson["_id"] = MongoDBTypeConverter::objectIdToString(
            result.inserted_id().get_oid().value);
    }

    return resultJson;
}

int MongoDBResultParser::parseInsertManyResult(const mongocxx::result::insert_many& result) {
    return static_cast<int>(result.inserted_count());
}

int MongoDBResultParser::parseUpdateResult(const mongocxx::result::update& result) {
    return static_cast<int>(result.modified_count());
}

int MongoDBResultParser::parseDeleteResult(const mongocxx::result::delete_result& result) {
    return static_cast<int>(result.deleted_count());
}

std::vector<Json> MongoDBResultParser::cursorToJsonArray(mongocxx::cursor& cursor) {
    std::vector<Json> items;

    for (auto&& doc : cursor) {
        items.push_back(MongoDBTypeConverter::bsonToJson(doc));
    }

    return items;
}

std::optional<Json> MongoDBResultParser::optionalDocumentToJson(
    const std::optional<bsoncxx::document::value>& doc) {

    if (!doc) {
        return std::nullopt;
    }

    return MongoDBTypeConverter::bsonToJson(doc->view());
}

ListResult<Json> MongoDBResultParser::buildListResult(mongocxx::cursor& cursor,
                                                      int total,
                                                      int page,
                                                      int limit) {
    ListResult<Json> listResult;
    listResult.items = cursorToJsonArray(cursor);
    listResult.total = total;
    listResult.page = page;
    listResult.limit = limit;

    return listResult;
}

} // namespace mongodb
} // namespace adapters
} // namespace dbal
