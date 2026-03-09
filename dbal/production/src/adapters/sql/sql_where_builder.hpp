#pragma once

#include <string>
#include <vector>
#include <unordered_set>
#include <stdexcept>
#include "dbal/core/types.hpp"
#include "sql_types.hpp"

namespace dbal {
namespace adapters {
namespace sql {

/**
 * SqlWhereBuilder — Schema-validated, parameterized SQL WHERE clause builder.
 *
 * Security guarantees:
 *   - All field names validated against entity schema before use.
 *   - Operators are enum values — no user-supplied operator strings reach SQL.
 *   - All values are bound parameters (never concatenated into SQL).
 *   - tenantId filter is always AND'd at root level (never inside OR groups).
 *
 * Supports: FilterCondition (AND-joined), FilterGroup (OR-within, AND-between),
 *           legacy equality filter map, aggregations, DISTINCT, GROUP BY.
 */
class SqlWhereBuilder {
public:
    /**
     * Build a parameterized WHERE clause string.
     *
     * @param conditions    AND-joined typed conditions from ListOptions.conditions
     * @param filter_groups OR-groups from ListOptions.filter_groups
     * @param legacy_filter Simple equality map (ListOptions.filter, tenantId always here)
     * @param valid_fields  Set of field names allowed by the entity schema
     * @param dialect       "postgresql" | "sqlite" | "mysql"
     * @param params        Bound parameters (appended in order)
     * @param param_index   Current parameter index (1-based, updated in place)
     * @return "WHERE ..." string, or empty string if no conditions
     * @throws std::invalid_argument if an unknown field name is used
     */
    static std::string build(
        const std::vector<FilterCondition>& conditions,
        const std::vector<FilterGroup>& filter_groups,
        const std::map<std::string, std::string>& legacy_filter,
        const std::unordered_set<std::string>& valid_fields,
        const std::string& dialect,
        std::vector<SqlParam>& params,
        int& param_index)
    {
        std::vector<std::string> root_fragments;

        // 1. Legacy equality filter (includes tenantId — always at root AND level)
        for (const auto& [key, value] : legacy_filter) {
            validateField(key, valid_fields);
            root_fragments.push_back(quoteId(key, dialect) + " = " + ph(param_index, dialect));
            params.push_back({key, value});
            ++param_index;
        }

        // 2. Typed AND conditions
        for (const auto& cond : conditions) {
            validateField(cond.field, valid_fields);
            root_fragments.push_back(buildCondition(cond, dialect, params, param_index));
        }

        // 3. OR groups (each group is OR-internally, AND'd at root)
        for (const auto& group : filter_groups) {
            if (group.conditions.empty()) continue;
            std::vector<std::string> or_parts;
            for (const auto& cond : group.conditions) {
                validateField(cond.field, valid_fields);
                or_parts.push_back(buildCondition(cond, dialect, params, param_index));
            }
            if (or_parts.size() == 1) {
                root_fragments.push_back(or_parts[0]);
            } else {
                root_fragments.push_back("(" + join(or_parts, " OR ") + ")");
            }
        }

        if (root_fragments.empty()) return "";
        return "WHERE " + join(root_fragments, " AND ");
    }

    /**
     * Build ORDER BY clause from sort map.
     * Validates all field names against entity schema.
     */
    static std::string buildOrderBy(
        const std::map<std::string, std::string>& sort,
        const std::unordered_set<std::string>& valid_fields,
        const std::string& default_field,
        const std::string& dialect)
    {
        if (sort.empty()) {
            return "ORDER BY " + quoteId(default_field, dialect) + " DESC";
        }
        std::vector<std::string> parts;
        for (const auto& [field, dir] : sort) {
            validateField(field, valid_fields);
            std::string direction = (dir == "asc" || dir == "ASC") ? "ASC" : "DESC";
            parts.push_back(quoteId(field, dialect) + " " + direction);
        }
        return "ORDER BY " + join(parts, ", ");
    }

    /**
     * Build SELECT list for aggregations.
     * Validates all field names. Func is from AggFunc enum (not user string).
     */
    static std::string buildAggregateSelect(
        const std::vector<AggregateSpec>& aggregates,
        const std::vector<std::string>& group_by_fields,
        const std::unordered_set<std::string>& valid_fields,
        const std::string& dialect)
    {
        std::vector<std::string> parts;
        for (const auto& agg : aggregates) {
            if (agg.field != "*") validateField(agg.field, valid_fields);
            std::string func = aggFuncName(agg.func);
            std::string col  = (agg.field == "*") ? "*" : quoteId(agg.field, dialect);
            parts.push_back(func + "(" + col + ") AS " + quoteId(agg.alias, dialect));
        }
        for (const auto& gb : group_by_fields) {
            validateField(gb, valid_fields);
            parts.push_back(quoteId(gb, dialect));
        }
        return join(parts, ", ");
    }

    /**
     * Build GROUP BY clause from group_by fields.
     */
    static std::string buildGroupBy(
        const std::vector<std::string>& group_by_fields,
        const std::unordered_set<std::string>& valid_fields,
        const std::string& dialect)
    {
        if (group_by_fields.empty()) return "";
        std::vector<std::string> parts;
        for (const auto& field : group_by_fields) {
            validateField(field, valid_fields);
            parts.push_back(quoteId(field, dialect));
        }
        return "GROUP BY " + join(parts, ", ");
    }

    /** Quote a SQL identifier per dialect */
    static std::string quoteId(const std::string& name, const std::string& dialect) {
        if (dialect == "mysql" || dialect == "mariadb") {
            return "`" + name + "`";
        }
        return "\"" + name + "\"";
    }

private:
    /** Validate field name is in the allowed set — throws on unknown field */
    static void validateField(const std::string& field,
                               const std::unordered_set<std::string>& valid_fields) {
        if (!valid_fields.count(field)) {
            throw std::invalid_argument("Unknown field: " + field);
        }
    }

    /** Parameter placeholder per dialect */
    static std::string ph(int index, const std::string& dialect) {
        if (dialect == "postgresql" || dialect == "postgres") {
            return "$" + std::to_string(index);
        }
        return "?";
    }

    /** Build a single condition fragment with bound params */
    static std::string buildCondition(
        const FilterCondition& cond,
        const std::string& dialect,
        std::vector<SqlParam>& params,
        int& param_index)
    {
        const std::string col = quoteId(cond.field, dialect);
        switch (cond.op) {
            case FilterOp::Eq:
                params.push_back({cond.field, cond.value});
                return col + " = " + ph(param_index++, dialect);
            case FilterOp::Ne:
                params.push_back({cond.field, cond.value});
                return col + " <> " + ph(param_index++, dialect);
            case FilterOp::Lt:
                params.push_back({cond.field, cond.value});
                return col + " < " + ph(param_index++, dialect);
            case FilterOp::Lte:
                params.push_back({cond.field, cond.value});
                return col + " <= " + ph(param_index++, dialect);
            case FilterOp::Gt:
                params.push_back({cond.field, cond.value});
                return col + " > " + ph(param_index++, dialect);
            case FilterOp::Gte:
                params.push_back({cond.field, cond.value});
                return col + " >= " + ph(param_index++, dialect);
            case FilterOp::Like:
                params.push_back({cond.field, cond.value});
                return col + " LIKE " + ph(param_index++, dialect);
            case FilterOp::ILike:
                params.push_back({cond.field, cond.value});
                if (dialect == "postgresql" || dialect == "postgres")
                    return col + " ILIKE " + ph(param_index++, dialect);
                return "LOWER(" + col + ") LIKE LOWER(" + ph(param_index++, dialect) + ")";
            case FilterOp::IsNull:
                return col + " IS NULL";
            case FilterOp::IsNotNull:
                return col + " IS NOT NULL";
            case FilterOp::In:
            case FilterOp::NotIn: {
                if (cond.values.empty()) return "1=0";
                std::string op_str = (cond.op == FilterOp::In) ? "IN" : "NOT IN";
                std::vector<std::string> placeholders;
                for (const auto& v : cond.values) {
                    params.push_back({cond.field, v});
                    placeholders.push_back(ph(param_index++, dialect));
                }
                return col + " " + op_str + " (" + join(placeholders, ", ") + ")";
            }
            case FilterOp::Between:
                if (cond.values.size() < 2) return "1=1";
                params.push_back({cond.field, cond.values[0]});
                params.push_back({cond.field, cond.values[1]});
                { auto lo = ph(param_index++, dialect);
                  auto hi = ph(param_index++, dialect);
                  return col + " BETWEEN " + lo + " AND " + hi; }
            default:
                params.push_back({cond.field, cond.value});
                return col + " = " + ph(param_index++, dialect);
        }
    }

    static std::string aggFuncName(AggFunc func) {
        switch (func) {
            case AggFunc::Count: return "COUNT";
            case AggFunc::Sum:   return "SUM";
            case AggFunc::Avg:   return "AVG";
            case AggFunc::Min:   return "MIN";
            case AggFunc::Max:   return "MAX";
            default:             return "COUNT";
        }
    }

    static std::string join(const std::vector<std::string>& parts, const std::string& sep) {
        std::string result;
        for (size_t i = 0; i < parts.size(); ++i) {
            if (i) result += sep;
            result += parts[i];
        }
        return result;
    }
};

} // namespace sql
} // namespace adapters
} // namespace dbal
