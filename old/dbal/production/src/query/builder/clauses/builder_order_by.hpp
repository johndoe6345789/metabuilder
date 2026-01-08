#pragma once
/**
 * @file builder_order_by.hpp
 * @brief Set ORDER BY clause
 */

#include "builder_state.hpp"

namespace dbal::query {

/**
 * Set ORDER BY clause
 * @param state Builder state
 * @param column Column to order by
 * @param direction ASC or DESC
 */
inline void builder_order_by(BuilderState& state, const std::string& column, const std::string& direction = "ASC") {
    state.order_by = column + " " + direction;
}

} // namespace dbal::query
