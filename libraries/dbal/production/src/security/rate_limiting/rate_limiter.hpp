#pragma once
/**
 * @file rate_limiter.hpp
 * @brief Token bucket rate limiter (thread-safe wrapper)
 */

#include <string>
#include <unordered_map>
#include <mutex>
#include "rate_limit_try_acquire.hpp"
#include "rate_limit_remaining.hpp"

namespace dbal::security {

/**
 * Thread-safe token bucket rate limiter
 * Wraps individual rate limit functions with mutex protection
 */
class RateLimiter {
public:
    RateLimiter(double tokens_per_second, double max_tokens)
        : tokens_per_second_(tokens_per_second)
        , max_tokens_(max_tokens)
    {}
    
    bool try_acquire(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        return rate_limit_try_acquire(buckets_[key], tokens_per_second_, max_tokens_);
    }
    
    double remaining(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = buckets_.find(key);
        if (it == buckets_.end()) return max_tokens_;
        return rate_limit_remaining(it->second, max_tokens_);
    }
    
    void reset(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        buckets_.erase(key);
    }
    
private:
    double tokens_per_second_;
    double max_tokens_;
    std::unordered_map<std::string, TokenBucket> buckets_;
    std::mutex mutex_;
};

} // namespace dbal::security
