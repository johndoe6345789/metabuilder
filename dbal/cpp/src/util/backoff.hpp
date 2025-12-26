#pragma once
/**
 * @file backoff.hpp
 * @brief Exponential backoff (wrapper class)
 */

#include "backoff_sleep.hpp"
#include "backoff_reset.hpp"

namespace dbal::util {

/**
 * Exponential backoff helper class
 * Thin wrapper around backoff functions
 */
class ExponentialBackoff {
public:
    ExponentialBackoff(int initial_ms = 100, int max_ms = 30000, double multiplier = 2.0) {
        state_.current_ms = initial_ms;
        state_.max_ms = max_ms;
        state_.multiplier = multiplier;
        state_.attempt = 0;
    }
    
    void sleep() { backoff_sleep(state_); }
    void reset() { backoff_reset(state_, 100); }
    int currentMs() const { return state_.current_ms; }
    int attempt() const { return state_.attempt; }
    
private:
    BackoffState state_;
};

} // namespace dbal::util
