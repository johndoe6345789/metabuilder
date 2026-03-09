#include "sql_type_mapper.hpp"
#include <algorithm>
#include <cctype>

namespace dbal {
namespace adapters {
namespace sql {

std::string SqlTypeMapper::yamlTypeToSqlType(const std::string& yaml_type, Dialect dialect) {
    // Map YAML field types to SQL column types
    if (yaml_type == "string") {
        return "VARCHAR(255)";
    } else if (yaml_type == "text") {
        return "TEXT";
    } else if (yaml_type == "number" || yaml_type == "integer" || yaml_type == "int") {
        return "INTEGER";
    } else if (yaml_type == "bigint") {
        if (dialect == Dialect::MySQL) {
            return "BIGINT";
        }
        return "BIGINT";
    } else if (yaml_type == "boolean") {
        if (dialect == Dialect::MySQL) {
            return "TINYINT(1)";
        }
        return "BOOLEAN";
    } else if (yaml_type == "date" || yaml_type == "datetime") {
        if (dialect == Dialect::MySQL) {
            return "DATETIME";
        }
        return "TIMESTAMP";
    } else if (yaml_type == "json") {
        if (dialect == Dialect::Postgres || dialect == Dialect::Prisma) {
            return "JSONB";
        }
        return "JSON";
    } else if (yaml_type == "uuid") {
        if (dialect == Dialect::Postgres || dialect == Dialect::Prisma) {
            return "UUID";
        }
        return "VARCHAR(36)";
    }

    // Default fallback
    return "VARCHAR(255)";
}

std::string SqlTypeMapper::jsonValueToString(const Json& value) {
    if (value.is_null()) {
        return "";
    } else if (value.is_boolean()) {
        return value.get<bool>() ? "true" : "false";
    } else if (value.is_number()) {
        return std::to_string(value.get<int64_t>());
    } else if (value.is_string()) {
        return value.get<std::string>();
    } else {
        return value.dump();
    }
}

Json SqlTypeMapper::sqlValueToJson(const std::string& value, const std::string& field_type) {
    if (value.empty()) {
        return nullptr;
    }

    if (isBooleanType(field_type)) {
        return (value == "1" || value == "t" || value == "true" || value == "T" || value == "TRUE");
    } else if (isNumericType(field_type)) {
        try {
            return std::stoll(value);
        } catch (...) {
            return nullptr;
        }
    } else {
        return value;
    }
}

std::string SqlTypeMapper::toSnakeCase(const std::string& pascal_case) {
    std::string result;
    for (size_t i = 0; i < pascal_case.size(); ++i) {
        char c = pascal_case[i];
        if (i > 0 && std::isupper(static_cast<unsigned char>(c))) {
            result += '_';
        }
        result += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    }
    return result;
}

bool SqlTypeMapper::isNumericType(const std::string& field_type) {
    return field_type == "number" || field_type == "bigint" ||
           field_type == "integer" || field_type == "int";
}

bool SqlTypeMapper::isBooleanType(const std::string& field_type) {
    return field_type == "boolean";
}

} // namespace sql
} // namespace adapters
} // namespace dbal
