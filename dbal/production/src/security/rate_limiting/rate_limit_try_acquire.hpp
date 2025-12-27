#pragma once
/**
 * @file rate_limit_try_acquire.hpp
 * @brief Token bucket acquire logic
 */

#include <chrono>
#include <algorithm>

namespace dbal::security {

/**
 * Token bucket state
 */
struct TokenBucket {
    double tokens = 0;
    std::chrono::steady_clock::time_point last_update{};
};

/**
 * Try to acquire a token from bucket, refilling based on elapsed time
 * @param bucket The token bucket state
 * @param tokens_per_second Refill rate
 * @param max_tokens Maximum bucket capacity
 * @return true if token acquired, false if rate limited
 */
inline bool rate_limit_try_acquire(
    TokenBucket& bucket,
    double tokens_per_second,
    double max_tokens
) {
    auto now = std::chrono::steady_clock::now();
    
    // Initialize new buckets
    if (bucket.tokens == 0 && bucket.last_update.time_since_epoch().count() == 0) {
        bucket.tokens = max_tokens;
        bucket.last_update = now;
    }
    
    // Refill tokens based on elapsed time
    auto elapsed = std::chrono::duration<double>(now - bucket.last_update).count();
    bucket.tokens = std::min(max_tokens, bucket.tokens + elapsed * tokens_per_second);
    bucket.last_update = now;
    
    // Try to consume
    if (bucket.tokens >= 1.0) {
        bucket.tokens -= 1.0;
        return true;
    }
    
    return false;
}

} // namespace dbal::security
