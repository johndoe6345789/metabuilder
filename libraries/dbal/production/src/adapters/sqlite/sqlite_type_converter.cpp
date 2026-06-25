#include "sqlite_type_converter.hpp"

namespace dbal {
namespace adapters {
namespace sqlite {

// Sentinel string used to represent SQL NULL in parameter vectors.
// Using SOH+NULL+SOH — cannot appear in user data.
static const std::string kSqlNullSentinel = "\x01NULL\x01";

std::string SQLiteTypeConverter::jsonValueToString(const Json& value) {
    if (value.is_null()) {
        return kSqlNullSentinel;
    } else if (value.is_boolean()) {
        return value.get<bool>() ? "1" : "0";
    } else if (value.is_number()) {
        return std::to_string(value.get<int64_t>());
    } else if (value.is_string()) {
        return value.get<std::string>();
    } else {
        return value.dump();
    }
}

std::vector<std::string> SQLiteTypeConverter::jsonToValues(const core::EntitySchema& schema,
                                                            const Json& data,
                                                            const std::string& prependId) {
    std::vector<std::string> values;

    if (!prependId.empty()) {
        values.push_back(prependId);
    }

    for (const auto& field : schema.fields) {
        // Only skip fields that are marked as generated AND not provided in data
        if (field.generated && !data.contains(field.name)) {
            continue;
        }
        if (data.contains(field.name)) {
            values.push_back(jsonValueToString(data[field.name]));
        }
    }

    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildUpdateParams(const core::EntitySchema& schema,
                                                                 const Json& data,
                                                                 const std::string& id) {
    std::vector<std::string> values;

    // First add SET clause values
    for (const auto& field : schema.fields) {
        // Skip id field (can't update primary key) and skip createdAt (immutable)
        if (field.name == "id" || field.name == "createdAt") {
            continue;
        }
        if (data.contains(field.name)) {
            values.push_back(jsonValueToString(data[field.name]));
        }
    }

    // Then add WHERE clause value (id)
    values.push_back(id);

    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildUpdateManyParams(const core::EntitySchema& schema,
                                                                     const Json& filter,
                                                                     const Json& data) {
    std::vector<std::string> values;

    // First add SET clause values
    for (const auto& field : schema.fields) {
        if (data.contains(field.name)) {
            values.push_back(jsonValueToString(data[field.name]));
        }
    }

    // Then add WHERE clause values
    for (const auto& [key, value] : filter.items()) {
        values.push_back(jsonValueToString(value));
    }

    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildDeleteManyParams(const Json& filter) {
    std::vector<std::string> values;
    for (const auto& [key, value] : filter.items()) {
        values.push_back(jsonValueToString(value));
    }
    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildFindParams(const Json& filter) {
    std::vector<std::string> values;
    for (const auto& [key, value] : filter.items()) {
        values.push_back(jsonValueToString(value));
    }
    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildCountParams(const ListOptions& options) {
    std::vector<std::string> values;
    for (const auto& [key, value] : options.filter) { values.push_back(value); }
    for (const auto& cond : options.conditions) { appendConditionValues(cond, values); }
    for (const auto& group : options.filter_groups) {
        for (const auto& cond : group.conditions) { appendConditionValues(cond, values); }
    }
    return values;
}

std::vector<std::string> SQLiteTypeConverter::buildListParams(const ListOptions& options) {
    std::vector<std::string> values;

    // Legacy equality filters (std::map iterates in sorted key order, matching buildListQuery)
    for (const auto& [key, value] : options.filter) {
        values.push_back(value);
    }

    // Typed AND conditions
    for (const auto& cond : options.conditions) {
        appendConditionValues(cond, values);
    }

    // OR groups
    for (const auto& group : options.filter_groups) {
        for (const auto& cond : group.conditions) {
            appendConditionValues(cond, values);
        }
    }

    // LIMIT and OFFSET
    const int limit = options.limit > 0 ? options.limit : 50;
    const int offset = options.page > 1 ? (options.page - 1) * limit : 0;
    values.push_back(std::to_string(limit));
    values.push_back(std::to_string(offset));

    return values;
}

void SQLiteTypeConverter::appendConditionValues(const FilterCondition& cond,
                                                std::vector<std::string>& out) {
    switch (cond.op) {
        case FilterOp::IsNull:
        case FilterOp::IsNotNull:
            break; // no bound parameters
        case FilterOp::In:
        case FilterOp::NotIn:
            for (const auto& v : cond.values) out.push_back(v);
            break;
        case FilterOp::Between:
            if (cond.values.size() >= 2) {
                out.push_back(cond.values[0]);
                out.push_back(cond.values[1]);
            }
            break;
        default:
            out.push_back(cond.value);
            break;
    }
}

} // namespace sqlite
} // namespace adapters
} // namespace dbal
