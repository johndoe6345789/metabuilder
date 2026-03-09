#include "sql_result_parser.hpp"
#include "sql_type_mapper.hpp"

namespace dbal {
namespace adapters {
namespace sql {

Json SqlResultParser::rowToJson(const SqlRow& row, const EntitySchema& schema) {
    Json result;
    for (const auto& field : schema.fields) {
        const std::string value = getColumnValue(row, field.name);
        result[field.name] = parseValue(value, field);
    }
    return result;
}

std::vector<Json> SqlResultParser::rowsToJson(const std::vector<SqlRow>& rows,
                                              const EntitySchema& schema) {
    std::vector<Json> results;
    results.reserve(rows.size());
    for (const auto& row : rows) {
        results.push_back(rowToJson(row, schema));
    }
    return results;
}

std::string SqlResultParser::getColumnValue(const SqlRow& row, const std::string& column_name) {
    const auto it = row.columns.find(column_name);
    return it != row.columns.end() ? it->second : "";
}

std::vector<std::pair<std::string, std::string>>
SqlResultParser::jsonToParams(const EntitySchema& schema,
                              const Json& data,
                              const std::string& prepend_id) {
    std::vector<std::pair<std::string, std::string>> params;

    // Prepend ID if provided (for UPDATE statements)
    if (!prepend_id.empty()) {
        params.emplace_back("id", prepend_id);
    }

    // Add all data fields
    for (const auto& field : schema.fields) {
        if (field.name == "id" || field.name == "createdAt") {
            continue; // Skip auto-generated fields
        }
        if (data.contains(field.name)) {
            params.emplace_back(field.name, SqlTypeMapper::jsonValueToString(data[field.name]));
        }
    }

    return params;
}

Json SqlResultParser::parseValue(const std::string& value, const EntityField& field) {
    if (value.empty() && !field.required) {
        return nullptr;
    }

    if (field.type == "boolean") {
        return (value == "1" || value == "t" || value == "true" || value == "T" || value == "TRUE");
    } else if (field.type == "number" || field.type == "bigint" || field.type == "integer" || field.type == "int") {
        if (!value.empty()) {
            try {
                return std::stoll(value);
            } catch (const std::invalid_argument&) {
                return nullptr;
            } catch (const std::out_of_range&) {
                return nullptr;
            }
        } else {
            return nullptr;
        }
    } else {
        // String or other types
        return value;
    }
}

} // namespace sql
} // namespace adapters
} // namespace dbal
