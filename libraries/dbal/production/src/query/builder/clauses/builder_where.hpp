#pragma once
/**
 * @file builder_where.hpp
 * @brief Add WHERE condition
 */

#include "../builder_state.hpp"

namespace dbal::query {

/**
 * Add WHERE condition
 * @param state Builder state
 * @param condition Condition string
 */
inline void builder_where(BuilderState& state, const std::string& condition) {
    state.conditions.push_back(condition);
}

} // namespace dbal::query
