#pragma once
/**
 * @file backoff_reset.hpp
 * @brief Reset backoff state
 */

#include "backoff_sleep.hpp"

namespace dbal::util {

/**
 * Reset backoff state to initial values
 * @param state The backoff state
 * @param initial_ms Initial delay in milliseconds
 */
inline void backoff_reset(BackoffState& state, int initial_ms = 100) {
    state.current_ms = initial_ms;
    state.attempt = 0;
}

} // namespace dbal::util
