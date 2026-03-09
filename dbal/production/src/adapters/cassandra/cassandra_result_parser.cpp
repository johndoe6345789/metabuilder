#include "cassandra_result_parser.hpp"
#include <spdlog/spdlog.h>
#include <cstring>

namespace dbal {
namespace adapters {
namespace cassandra {

Json CassandraResultParser::rowToJson(const CassRow* row, const EntitySchema& schema) {
    Json json_obj = Json::object();

    for (size_t i = 0; i < schema.fields.size(); ++i) {
        const auto& field = schema.fields[i];
        const CassValue* value = cass_row_get_column(row, i);

        if (isNull(row, i)) {
            json_obj[field.name] = nullptr;
            continue;
        }

        json_obj[field.name] = valueToJson(value, field.type);
    }

    return json_obj;
}

std::vector<Json> CassandraResultParser::resultToJsonArray(const CassResult* result, const EntitySchema& schema) {
    std::vector<Json> rows;

    CassIterator* iterator = cass_iterator_from_result(result);
    while (cass_iterator_next(iterator)) {
        const CassRow* row = cass_iterator_get_row(iterator);
        rows.push_back(rowToJson(row, schema));
    }
    cass_iterator_free(iterator);

    return rows;
}

Json CassandraResultParser::valueToJson(const CassValue* value, const std::string& field_type) {
    if (cass_value_is_null(value)) {
        return nullptr;
    }

    if (field_type == "string" || field_type == "json") {
        const char* str_value = nullptr;
        size_t str_length = 0;
        cass_value_get_string(value, &str_value, &str_length);
        return std::string(str_value, str_length);
    } else if (field_type == "number") {
        cass_double_t double_value = 0.0;
        cass_value_get_double(value, &double_value);
        return double_value;
    } else if (field_type == "boolean") {
        cass_bool_t bool_value = cass_false;
        cass_value_get_bool(value, &bool_value);
        return bool_value == cass_true;
    } else if (field_type == "timestamp") {
        cass_int64_t timestamp_value = 0;
        cass_value_get_int64(value, &timestamp_value);
        // Convert milliseconds to ISO 8601 string
        return std::to_string(timestamp_value);
    }

    // Default: try to convert to string
    const char* str_value = nullptr;
    size_t str_length = 0;
    if (cass_value_get_string(value, &str_value, &str_length) == CASS_OK) {
        return std::string(str_value, str_length);
    }

    return nullptr;
}

std::string CassandraResultParser::getString(const CassRow* row, size_t index) {
    const CassValue* value = cass_row_get_column(row, index);
    if (cass_value_is_null(value)) {
        return "";
    }

    const char* str_value = nullptr;
    size_t str_length = 0;
    cass_value_get_string(value, &str_value, &str_length);
    return std::string(str_value, str_length);
}

double CassandraResultParser::getDouble(const CassRow* row, size_t index) {
    const CassValue* value = cass_row_get_column(row, index);
    if (cass_value_is_null(value)) {
        return 0.0;
    }

    cass_double_t double_value = 0.0;
    cass_value_get_double(value, &double_value);
    return double_value;
}

bool CassandraResultParser::getBool(const CassRow* row, size_t index) {
    const CassValue* value = cass_row_get_column(row, index);
    if (cass_value_is_null(value)) {
        return false;
    }

    cass_bool_t bool_value = cass_false;
    cass_value_get_bool(value, &bool_value);
    return bool_value == cass_true;
}

std::string CassandraResultParser::getTimestamp(const CassRow* row, size_t index) {
    const CassValue* value = cass_row_get_column(row, index);
    if (cass_value_is_null(value)) {
        return "";
    }

    cass_int64_t timestamp_value = 0;
    cass_value_get_int64(value, &timestamp_value);
    return std::to_string(timestamp_value);
}

bool CassandraResultParser::isNull(const CassRow* row, size_t index) {
    const CassValue* value = cass_row_get_column(row, index);
    return cass_value_is_null(value);
}

} // namespace cassandra
} // namespace adapters
} // namespace dbal
