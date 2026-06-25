#include "surrealdb_type_converter.hpp"
#include <sstream>
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace surrealdb {

std::string SurrealDBTypeConverter::jsonToSurrealValue(const Json& value) {
    if (value.is_string()) {
        return quoteString(value.get<std::string>());
    }
    
    if (value.is_number_integer()) {
        return std::to_string(value.get<int64_t>());
    }
    
    if (value.is_number_float()) {
        return std::to_string(value.get<double>());
    }
    
    if (value.is_boolean()) {
        return value.get<bool>() ? "true" : "false";
    }
    
    if (value.is_null()) {
        return "NULL";
    }
    
    // Default: stringify the JSON object/array
    return quoteString(value.dump());
}

std::string SurrealDBTypeConverter::makeResourcePath(const std::string& entity_name, 
                                                     const std::string& id) {
    if (id.empty()) {
        return entity_name;
    }
    return entity_name + "/" + id;
}

std::string SurrealDBTypeConverter::filterToWhere(const Json& filter) {
    std::ostringstream oss;
    size_t count = 0;
    
    for (auto it = filter.begin(); it != filter.end(); ++it) {
        if (count > 0) {
            oss << " AND ";
        }
        oss << it.key() << " = " << jsonToSurrealValue(it.value());
        ++count;
    }
    
    return oss.str();
}

std::string SurrealDBTypeConverter::quoteString(const std::string& str) {
    return "'" + escapeString(str) + "'";
}

std::string SurrealDBTypeConverter::escapeString(const std::string& str) {
    std::string escaped;
    escaped.reserve(str.size());
    
    for (char c : str) {
        if (c == '\'') {
            escaped += "\\'";
        } else if (c == '\\') {
            escaped += "\\\\";
        } else {
            escaped += c;
        }
    }
    
    return escaped;
}

} // namespace surrealdb
} // namespace adapters
} // namespace dbal
