#ifndef DBAL_SQL_ADAPTER_HELPERS_HPP
#define DBAL_SQL_ADAPTER_HELPERS_HPP

#include <string>
#include <vector>
#include "sql_types.hpp"
#include "sql_connection.hpp"
#include "dbal/types.hpp"
#include "../schema_loader.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SQL query building helpers
 */
class SqlQueryBuilder {
public:
    static std::string buildInsertSql(const EntitySchema& schema, const Json& data, Dialect dialect);
    static std::string buildSelectSql(const EntitySchema& schema, const Json& filter, Dialect dialect);
    static std::string buildUpdateSql(const EntitySchema& schema, const std::string& id, const Json& data, Dialect dialect);
    static std::string buildDeleteSql(const EntitySchema& schema, const std::string& id, Dialect dialect);
    static std::string buildFieldList(const EntitySchema& schema);
};

/**
 * Data conversion helpers
 */
class SqlDataConverter {
public:
    static std::vector<SqlParam> jsonToParams(const EntitySchema& schema, const Json& data, const std::string& prependId = "");
    static Json rowToJson(const EntitySchema& schema, const SqlRow& row);
    static std::string jsonValueToString(const Json& value);
    static std::string columnValue(const SqlRow& row, const std::string& key);
};

/**
 * Utility helpers
 */
class SqlUtils {
public:
    static std::string toLowerSnakeCase(const std::string& pascalCase);
    static std::string joinFragments(const std::vector<std::string>& fragments, const std::string& separator);
    static std::string placeholder(size_t index, Dialect dialect);
};

}
}
}

#endif
