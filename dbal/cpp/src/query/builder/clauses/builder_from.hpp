#pragma once
/**
 * @file builder_from.hpp
 * @brief Set FROM table
 */

#include "builder_state.hpp"

namespace dbal::query {

/**
 * Set table for query
 * @param state Builder state
 * @param table Table name
 */
inline void builder_from(BuilderState& state, const std::string& table) {
    state.table = table;
}

} // namespace dbal::query
