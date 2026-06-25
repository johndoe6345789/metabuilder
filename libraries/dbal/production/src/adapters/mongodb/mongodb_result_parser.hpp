#ifndef DBAL_MONGODB_RESULT_PARSER_HPP
#define DBAL_MONGODB_RESULT_PARSER_HPP

#include <mongocxx/cursor.hpp>
#include <mongocxx/result/insert_one.hpp>
#include <mongocxx/result/insert_many.hpp>
#include <mongocxx/result/update.hpp>
#include <mongocxx/result/delete.hpp>
#include <bsoncxx/document/view.hpp>
#include <nlohmann/json.hpp>
#include <optional>
#include <vector>
#include "dbal/adapters/adapter.hpp"

namespace dbal {
namespace adapters {
namespace mongodb {

using Json = nlohmann::json;

/**
 * MongoDB Result Parser - Static utilities for parsing MongoDB operation results
 *
 * Converts MongoDB operation results to JSON/DBAL types:
 * - Insert results → JSON with _id
 * - Query cursors → JSON arrays
 * - Update/Delete results → counts
 * - Document views → JSON objects
 */
class MongoDBResultParser {
public:
    /**
     * Parse insert_one result and add _id to original data
     *
     * @param result MongoDB insert result
     * @param originalData Original JSON data
     * @return JSON with _id field added
     */
    static Json parseInsertResult(const mongocxx::result::insert_one& result,
                                  const Json& originalData);

    /**
     * Parse insert_many result
     *
     * @param result MongoDB insert_many result
     * @return Number of documents inserted
     */
    static int parseInsertManyResult(const mongocxx::result::insert_many& result);

    /**
     * Parse update result
     *
     * @param result MongoDB update result
     * @return Number of documents modified
     */
    static int parseUpdateResult(const mongocxx::result::update& result);

    /**
     * Parse delete result
     *
     * @param result MongoDB delete result
     * @return Number of documents deleted
     */
    static int parseDeleteResult(const mongocxx::result::delete_result& result);

    /**
     * Convert cursor results to JSON array
     *
     * @param cursor MongoDB cursor
     * @return Vector of JSON objects
     */
    static std::vector<Json> cursorToJsonArray(mongocxx::cursor& cursor);

    /**
     * Convert optional document result to JSON
     *
     * @param doc Optional BSON document
     * @return JSON object if present, std::nullopt otherwise
     */
    static std::optional<Json> optionalDocumentToJson(
        const std::optional<bsoncxx::document::value>& doc);

    /**
     * Build ListResult from cursor and total count
     *
     * @param cursor MongoDB cursor
     * @param total Total document count
     * @param page Current page number
     * @param limit Items per page
     * @return ListResult containing items and metadata
     */
    static ListResult<Json> buildListResult(mongocxx::cursor& cursor,
                                           int total,
                                           int page,
                                           int limit);

private:
    // Disable instantiation (static utility class)
    MongoDBResultParser() = delete;
};

} // namespace mongodb
} // namespace adapters
} // namespace dbal

#endif // DBAL_MONGODB_RESULT_PARSER_HPP
