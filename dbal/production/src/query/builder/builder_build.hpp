#pragma once
/**
 * @file builder_build.hpp
 * @brief Build query string from state
 */

#include "builder_state.hpp"

namespace dbal::query {

/**
 * Build SQL query string from state
 * @param state Builder state
 * @return SQL query string
 */
inline std::string builder_build(const BuilderState& state) {
    std::string query = state.query_type + " ";
    
    if (!state.columns.empty()) {
        for (size_t i = 0; i < state.columns.size(); ++i) {
            query += state.columns[i];
            if (i < state.columns.size() - 1) query += ", ";
        }
    } else {
        query += "*";
    }
    
    query += " FROM " + state.table;
    
    if (!state.conditions.empty()) {
        query += " WHERE ";
        for (size_t i = 0; i < state.conditions.size(); ++i) {
            query += state.conditions[i];
            if (i < state.conditions.size() - 1) query += " AND ";
        }
    }
    
    if (!state.order_by.empty()) {
        query += " ORDER BY " + state.order_by;
    }
    
    if (state.limit > 0) {
        query += " LIMIT " + std::to_string(state.limit);
    }
    
    return query;
}

} // namespace dbal::query
