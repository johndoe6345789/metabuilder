#include "list_handler.hpp"
#include "json_convert.hpp"
#include <exception>
#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>
#include <regex>
#include <algorithm>
#include <sstream>

namespace dbal {
namespace daemon {
namespace rpc {

bool ListHandler::parseIntValue(const std::string& value, int& out) {
    try {
        size_t idx = 0;
        int parsed = std::stoi(value, &idx);
        if (idx != value.size()) {
            return false;
        }
        out = parsed;
        return true;
    } catch (const std::exception&) {
        return false;
    }
}

::Json::Value ListHandler::parseQueryParameters(
    const std::map<std::string, std::string>& query,
    ErrorSender send_error
) {
    ::Json::Value options(::Json::objectValue);
    ::Json::Value filter(::Json::objectValue);
    ::Json::Value sort(::Json::objectValue);

    bool limit_set = false;
    bool page_set = false;
    bool offset_set = false;
    int limit_value = 0;
    int page_value = 0;
    int offset_value = 0;

    for (const auto& [key, value] : query) {
        spdlog::trace("ListHandler::parseQueryParameters: param '{}' = '{}'", key, value);

        if (key == "limit" || key == "take") {
            if (!parseIntValue(value, limit_value) || limit_value <= 0) {
                ResponseFormatter::sendError(
                    "limit must be a positive integer",
                    400,
                    send_error
                );
                return ::Json::Value::null;
            }
            limit_set = true;
        } else if (key == "page") {
            if (!parseIntValue(value, page_value) || page_value <= 0) {
                ResponseFormatter::sendError(
                    "page must be a positive integer",
                    400,
                    send_error
                );
                return ::Json::Value::null;
            }
            page_set = true;
        } else if (key == "skip" || key == "offset") {
            if (!parseIntValue(value, offset_value) || offset_value < 0) {
                ResponseFormatter::sendError(
                    "offset must be a non-negative integer",
                    400,
                    send_error
                );
                return ::Json::Value::null;
            }
            offset_set = true;
        } else if (key.rfind("filter.", 0) == 0) {
            filter[key.substr(7)] = value;
        } else if (key.rfind("where.", 0) == 0) {
            filter[key.substr(6)] = value;
        } else if (key.rfind("sort.", 0) == 0) {
            sort[key.substr(5)] = value;
        } else if (key.rfind("orderBy.", 0) == 0) {
            sort[key.substr(8)] = value;
        }
    }

    // Convert offset to page if needed
    if (offset_set && !page_set) {
        int effective_limit = limit_set ? limit_value : 20;
        if (effective_limit <= 0) {
            ResponseFormatter::sendError(
                "limit must be a positive integer",
                400,
                send_error
            );
            return ::Json::Value::null;
        }
        page_value = (offset_value / effective_limit) + 1;
        page_set = true;
    }

    // Build options object
    if (limit_set) {
        options["limit"] = limit_value;
    }
    if (page_set) {
        options["page"] = page_value;
    }
    if (!filter.empty()) {
        options["filter"] = filter;
    }
    if (!sort.empty()) {
        options["sort"] = sort;
    }

    return options;
}

// ===== Rich parsing helpers (file-local) =====

static std::vector<std::string> splitCsv(const std::string& s) {
    std::vector<std::string> parts;
    if (s.empty()) return parts;
    std::istringstream ss(s);
    std::string token;
    while (std::getline(ss, token, ',')) {
        if (!token.empty()) parts.push_back(token);
    }
    return parts;
}

static FilterOp parseOpString(const std::string& op) {
    if (op == "ne")       return FilterOp::Ne;
    if (op == "lt")       return FilterOp::Lt;
    if (op == "lte")      return FilterOp::Lte;
    if (op == "gt")       return FilterOp::Gt;
    if (op == "gte")      return FilterOp::Gte;
    if (op == "like")     return FilterOp::Like;
    if (op == "ilike")    return FilterOp::ILike;
    if (op == "in")       return FilterOp::In;
    if (op == "notin")    return FilterOp::NotIn;
    if (op == "isnull")   return FilterOp::IsNull;
    if (op == "isnotnull")return FilterOp::IsNotNull;
    if (op == "between")  return FilterOp::Between;
    return FilterOp::Eq;
}

// Parse "field" or "field[op]" → {field, op}
static std::pair<std::string, std::string> parseFieldOp(const std::string& key) {
    const auto lb = key.find('[');
    if (lb == std::string::npos) return {key, "eq"};
    const auto rb = key.find(']', lb);
    std::string field = key.substr(0, lb);
    std::string op    = (rb != std::string::npos) ? key.substr(lb + 1, rb - lb - 1) : "eq";
    std::transform(op.begin(), op.end(), op.begin(), ::tolower);
    return {field, op};
}

// Build a FilterCondition from field, op string, and raw value
static FilterCondition makeCondition(const std::string& field, const std::string& op_str,
                                     const std::string& value) {
    FilterCondition cond;
    cond.field = field;
    cond.op    = parseOpString(op_str);
    if (cond.op == FilterOp::In || cond.op == FilterOp::NotIn || cond.op == FilterOp::Between) {
        cond.values = splitCsv(value);
    } else {
        cond.value = value;
    }
    return cond;
}

void ListHandler::handleList(
    Client& client,
    const RouteInfo& route,
    const std::map<std::string, std::string>& query,
    ResponseSender send_success,
    ErrorSender send_error
) {
    spdlog::trace("ListHandler::handleList: tenant='{}', entity='{}'",
                  route.tenant, route.entity);

    ResponseFormatter::withExceptionHandling([&]() {
        // Parse legacy pagination params first (reuse existing logic)
        ::Json::Value options_json = parseQueryParameters(query, send_error);
        if (options_json.isNull()) return;

        ListOptions list_options;
        if (options_json.isMember("limit")) list_options.limit = options_json["limit"].asInt();
        if (options_json.isMember("page"))  list_options.page  = options_json["page"].asInt();

        // --- Rich parameter parsing ---
        // aggregates[idx] accumulates {"func","field","alias"} per index
        std::map<int, std::map<std::string, std::string>> agg_map;
        // or_groups[idx] accumulates FilterConditions per OR group index
        std::map<int, std::vector<FilterCondition>> or_map;

        for (const auto& [key, value] : query) {
            // filter.field[op]=val  or  where.field[op]=val
            if (key.rfind("filter.", 0) == 0 || key.rfind("where.", 0) == 0) {
                const size_t prefix_len = (key[0] == 'f') ? 7 : 6;
                const std::string rest = key.substr(prefix_len);
                auto [field, op_str] = parseFieldOp(rest);
                if (op_str == "eq") {
                    list_options.filter[field] = value;   // legacy equality (backward compat)
                } else {
                    list_options.conditions.push_back(makeCondition(field, op_str, value));
                }
                continue;
            }
            // sort.field=asc|desc  or  orderBy.field=asc|desc
            if (key.rfind("sort.", 0) == 0) {
                list_options.sort[key.substr(5)] = value;
                continue;
            }
            if (key.rfind("orderBy.", 0) == 0) {
                list_options.sort[key.substr(8)] = value;
                continue;
            }
            // or[idx].field[op]=val
            if (key.rfind("or[", 0) == 0) {
                const auto rb = key.find(']');
                if (rb == std::string::npos) continue;
                int idx = 0;
                try { idx = std::stoi(key.substr(3, rb - 3)); } catch (...) { continue; }
                const std::string rest = key.substr(rb + 2); // skip "]."
                auto [field, op_str] = parseFieldOp(rest);
                or_map[idx].push_back(makeCondition(field, op_str, value));
                continue;
            }
            // aggregate[idx][key]=val
            if (key.rfind("aggregate[", 0) == 0) {
                const auto rb1 = key.find(']');
                if (rb1 == std::string::npos) continue;
                int idx = 0;
                try { idx = std::stoi(key.substr(10, rb1 - 10)); } catch (...) { continue; }
                const auto lb2 = key.find('[', rb1);
                const auto rb2 = key.find(']', lb2 != std::string::npos ? lb2 : rb1);
                if (lb2 == std::string::npos || rb2 == std::string::npos) continue;
                const std::string sub_key = key.substr(lb2 + 1, rb2 - lb2 - 1);
                agg_map[idx][sub_key] = value;
                continue;
            }
            if (key == "include") {
                list_options.include = splitCsv(value);
                continue;
            }
            if (key == "select") {
                list_options.select_fields = splitCsv(value);
                continue;
            }
            if (key == "groupBy" || key == "group_by") {
                list_options.group_by = splitCsv(value);
                continue;
            }
            if (key == "distinct") {
                list_options.distinct = (value == "true" || value == "1");
                continue;
            }
        }

        // Convert accumulated OR groups to FilterGroup vector
        for (auto& [idx, conds] : or_map) {
            FilterGroup grp;
            grp.conditions = std::move(conds);
            list_options.filter_groups.push_back(std::move(grp));
        }

        // Convert accumulated aggregate map to AggregateSpec vector
        for (auto& [idx, fields] : agg_map) {
            const auto& func_str  = fields.count("func")  ? fields["func"]  : "count";
            const auto& field_str = fields.count("field") ? fields["field"] : "id";
            const auto& alias_str = fields.count("alias") ? fields["alias"] : func_str;
            AggFunc func = AggFunc::Count;
            if (func_str == "sum")   func = AggFunc::Sum;
            else if (func_str == "avg") func = AggFunc::Avg;
            else if (func_str == "min") func = AggFunc::Min;
            else if (func_str == "max") func = AggFunc::Max;
            list_options.aggregates.push_back({func, field_str, alias_str});
        }

        // Always filter by tenant (root AND — never inside OR group)
        if (!route.tenant.empty()) {
            list_options.filter["tenantId"] = route.tenant;
        }

        auto result = client.listEntities(route.entity, list_options);
        if (!result.isOk()) {
            const auto& error = result.error();
            const int http_code = static_cast<int>(error.code());
            if (http_code >= 500) {
                spdlog::error("ListHandler internal error for entity '{}': {}", route.entity, error.what());
                send_error("Internal server error", http_code);
            } else {
                send_error(error.what(), http_code);
            }
            return;
        }

        const auto& listResult = result.value();

        ::Json::Value data(::Json::objectValue);
        ::Json::Value items(::Json::arrayValue);
        for (const auto& item : listResult.items) {
            items.append(nlohmann_to_jsoncpp(item));
        }
        data["data"]  = items;
        data["total"] = listResult.total;
        data["page"]  = listResult.page;
        data["limit"] = listResult.limit;
        send_success(data);
    }, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
