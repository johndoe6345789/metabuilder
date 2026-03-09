#include "supabase_query_builder.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

std::string SupabaseQueryBuilder::buildFilterQuery(const Json& filter) {
    std::ostringstream query;
    bool first = true;

    for (auto it = filter.begin(); it != filter.end(); ++it) {
        if (!first) query << "&";
        first = false;

        const std::string& key = it.key();
        const auto& value = it.value();

        // Supabase PostgREST filter syntax: field=eq.value
        query << key << "=eq." << escapeValue(value);
    }

    return query.str();
}

std::string SupabaseQueryBuilder::buildPaginationQuery(int limit, int page) {
    std::ostringstream query;
    const int offset = page > 1 ? (page - 1) * limit : 0;
    query << "limit=" << limit << "&offset=" << offset;
    return query.str();
}

std::string SupabaseQueryBuilder::buildSortQuery(const std::map<std::string, std::string>& sort) {
    std::ostringstream query;
    bool first = true;

    for (const auto& [field, direction] : sort) {
        if (!first) query << "&";
        first = false;

        query << "order=" << field << "." << (direction == "desc" ? "desc" : "asc");
    }

    return query.str();
}

std::string SupabaseQueryBuilder::buildListQuery(const std::string& entity_name, const ListOptions& options) {
    std::ostringstream query;
    query << entity_name;

    bool hasQuery = false;

    // Add filters
    if (!options.filter.empty()) {
        query << "?" << buildFilterQuery(options.filter);
        hasQuery = true;
    }

    // Add pagination
    const int limit = options.limit > 0 ? options.limit : 50;
    query << (hasQuery ? "&" : "?") << buildPaginationQuery(limit, options.page);
    hasQuery = true;

    // Add sorting
    if (!options.sort.empty()) {
        query << "&" << buildSortQuery(options.sort);
    }

    return query.str();
}

std::string SupabaseQueryBuilder::buildReadQuery(const std::string& entity_name, const std::string& id) {
    return entity_name + "?id=eq." + id;
}

std::string SupabaseQueryBuilder::buildIdFilterQuery(const std::string& entity_name, const std::string& id) {
    return buildReadQuery(entity_name, id);
}

std::string SupabaseQueryBuilder::escapeValue(const Json& value) {
    if (value.is_string()) {
        return value.get<std::string>();
    } else if (value.is_number_integer()) {
        return std::to_string(value.get<int>());
    } else if (value.is_number_float()) {
        return std::to_string(value.get<double>());
    } else if (value.is_boolean()) {
        return value.get<bool>() ? "true" : "false";
    } else {
        return value.dump();
    }
}

} // namespace supabase
} // namespace adapters
} // namespace dbal
