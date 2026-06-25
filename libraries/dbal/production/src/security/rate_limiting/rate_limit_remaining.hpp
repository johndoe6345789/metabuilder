#pragma once
/**
 * @file rate_limit_remaining.hpp
 * @brief Get remaining tokens in bucket
 */

#include "rate_limit_try_acquire.hpp"

namespace dbal::security {

/**
 * Get remaining tokens in a bucket
 * @param bucket The token bucket
 * @param max_tokens Default if bucket uninitialized
 * @return Number of remaining tokens
 */
inline double rate_limit_remaining(const TokenBucket& bucket, double max_tokens) {
    if (bucket.last_update.time_since_epoch().count() == 0) {
        return max_tokens;
    }
    return bucket.tokens;
}

} // namespace dbal::security
