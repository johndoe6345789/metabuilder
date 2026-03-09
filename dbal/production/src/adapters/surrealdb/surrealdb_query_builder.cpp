#include "surrealdb_query_builder.hpp"
#include "surrealdb_type_converter.hpp"
#include <sstream>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

std::string SurrealDBQueryBuilder::buildSelectQuery(const std::string& entity_name, 
                                                    const ListOptions& options) {
    std::ostringstream oss;
    oss << "SELECT * FROM " << entity_name;
    
    // Add WHERE clause if filter provided
    if (!options.filter.empty()) {
        oss << " WHERE " << buildWhereClause(options.filter);
    }
    
    // Add LIMIT and offset
    oss << buildLimitClause(options.limit, options.page);
    
    spdlog::debug("Built SurrealQL SELECT: {}", oss.str());
    return oss.str();
}

std::string SurrealDBQueryBuilder::buildCreateQuery(const std::string& entity_name, 
                                                    const Json& data) {
    std::ostringstream oss;
    oss << "CREATE " << entity_name << " SET " << buildSetClause(data);
    
    spdlog::debug("Built SurrealQL CREATE: {}", oss.str());
    return oss.str();
}

std::string SurrealDBQueryBuilder::buildUpdateQuery(const std::string& entity_name, 
                                                    const std::string& id, 
                                                    const Json& data) {
    std::ostringstream oss;
    oss << "UPDATE " << entity_name << ":" << id << " SET " << buildSetClause(data);
    
    spdlog::debug("Built SurrealQL UPDATE: {}", oss.str());
    return oss.str();
}

std::string SurrealDBQueryBuilder::buildDeleteQuery(const std::string& entity_name, 
                                                    const std::string& id) {
    std::ostringstream oss;
    oss << "DELETE " << entity_name << ":" << id;
    
    spdlog::debug("Built SurrealQL DELETE: {}", oss.str());
    return oss.str();
}

std::string SurrealDBQueryBuilder::buildWhereClause(const Json& filter) {
    return SurrealDBTypeConverter::filterToWhere(filter);
}

std::string SurrealDBQueryBuilder::buildLimitClause(int limit, int page) {
    std::ostringstream oss;
    
    // Default limit if not specified
    const int effective_limit = (limit > 0) ? limit : 100;
    const int offset = page * effective_limit;
    
    oss << " LIMIT " << effective_limit << " START " << offset;
    return oss.str();
}

std::string SurrealDBQueryBuilder::buildSetClause(const Json& data) {
    std::ostringstream oss;
    size_t count = 0;
    
    for (auto it = data.begin(); it != data.end(); ++it) {
        if (count > 0) {
            oss << ", ";
        }
        oss << it.key() << " = " << SurrealDBTypeConverter::jsonToSurrealValue(it.value());
        ++count;
    }
    
    return oss.str();
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
