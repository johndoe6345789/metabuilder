#pragma once
/**
 * @file backoff_sleep.hpp
 * @brief Exponential backoff sleep function
 */

#include <thread>
#include <chrono>
#include <algorithm>

namespace dbal::util {

/**
 * Backoff state
 */
struct BackoffState {
    int current_ms = 100;
    int max_ms = 30000;
    double multiplier = 2.0;
    int attempt = 0;
};

/**
 * Sleep for current backoff duration and increase for next attempt
 * @param state The backoff state
 */
inline void backoff_sleep(BackoffState& state) {
    std::this_thread::sleep_for(std::chrono::milliseconds(state.current_ms));
    state.current_ms = std::min(static_cast<int>(state.current_ms * state.multiplier), state.max_ms);
    state.attempt++;
}

} // namespace dbal::util
