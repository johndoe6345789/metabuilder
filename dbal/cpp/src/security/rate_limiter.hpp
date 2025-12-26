#pragma once
/**
 * @file rate_limiter.hpp
 * @brief Token bucket rate limiter
 * @details Header-only, thread-safe rate limiting
 */

#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>

namespace dbal::security {

/**
 * Thread-safe token bucket rate limiter
 */
class RateLimiter {
public:
    /**
     * @param tokens_per_second Refill rate
     * @param max_tokens Maximum bucket size (burst capacity)
     */
    RateLimiter(double tokens_per_second, double max_tokens)
        : tokens_per_second_(tokens_per_second)
        , max_tokens_(max_tokens)
    {}
    
    /**
     * Try to consume a token for the given key
     * @param key Client identifier (IP, user ID, etc.)
     * @return true if allowed, false if rate limited
     */
    bool try_acquire(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto now = std::chrono::steady_clock::now();
        auto& bucket = buckets_[key];
        
        // Initialize new buckets
        if (bucket.tokens == 0 && bucket.last_update.time_since_epoch().count() == 0) {
            bucket.tokens = max_tokens_;
            bucket.last_update = now;
        }
        
        // Refill tokens based on elapsed time
        auto elapsed = std::chrono::duration<double>(now - bucket.last_update).count();
        bucket.tokens = std::min(max_tokens_, bucket.tokens + elapsed * tokens_per_second_);
        bucket.last_update = now;
        
        // Try to consume
        if (bucket.tokens >= 1.0) {
            bucket.tokens -= 1.0;
            return true;
        }
        
        return false;
    }
    
    /**
     * Get remaining tokens for a key
     */
    double remaining(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = buckets_.find(key);
        if (it == buckets_.end()) return max_tokens_;
        return it->second.tokens;
    }
    
    /**
     * Reset a specific key's bucket
     */
    void reset(const std::string& key) {
        std::lock_guard<std::mutex> lock(mutex_);
        buckets_.erase(key);
    }
    
private:
    struct Bucket {
        double tokens = 0;
        std::chrono::steady_clock::time_point last_update{};
    };
    
    double tokens_per_second_;
    double max_tokens_;
    std::unordered_map<std::string, Bucket> buckets_;
    std::mutex mutex_;
};

} // namespace dbal::security
