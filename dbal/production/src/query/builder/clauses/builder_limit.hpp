#pragma once
/**
 * @file builder_limit.hpp
 * @brief Set LIMIT clause
 */

#include "../builder_state.hpp"

namespace dbal::query {

/**
 * Set LIMIT clause
 * @param state Builder state
 * @param limit Max rows
 */
inline void builder_limit(BuilderState& state, int limit) {
    state.limit = limit;
}

} // namespace dbal::query
