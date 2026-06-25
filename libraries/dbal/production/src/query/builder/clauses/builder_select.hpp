#pragma once
/**
 * @file builder_select.hpp
 * @brief Set SELECT columns
 */

#include "../builder_state.hpp"

namespace dbal::query {

/**
 * Set columns for SELECT query
 * @param state Builder state
 * @param columns Columns to select
 */
inline void builder_select(BuilderState& state, const std::vector<std::string>& columns) {
    state.query_type = "SELECT";
    state.columns = columns;
}

} // namespace dbal::query
