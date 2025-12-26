#pragma once
/**
 * @file nonce_store.hpp
 * @brief Nonce storage for replay attack prevention
 * @details Header-only, thread-safe nonce management
 */

#include <string>
#include <unordered_map>
#include <chrono>
#include <mutex>

namespace dbal::security {

/**
 * Thread-safe nonce store with automatic expiry
 * Used to prevent replay attacks in signed requests
 */
class NonceStore {
public:
    /**
     * @param expiry_seconds How long nonces are remembered
     * @param cleanup_interval_seconds How often to purge expired (0 = every check)
     */
    explicit NonceStore(
        int expiry_seconds = 300,
        int cleanup_interval_seconds = 60
    )
        : expiry_seconds_(expiry_seconds)
        , cleanup_interval_seconds_(cleanup_interval_seconds)
    {}
    
    /**
     * Check if nonce was already used, and mark it as used
     * @param nonce The nonce string to check
     * @return true if nonce is fresh (not seen before), false if replay
     */
    bool check_and_store(const std::string& nonce) {
        std::lock_guard<std::mutex> lock(mutex_);
        
        auto now = std::chrono::steady_clock::now();
        
        // Periodic cleanup
        maybe_cleanup(now);
        
        // Check if already exists
        auto it = nonces_.find(nonce);
        if (it != nonces_.end()) {
            // Replay detected
            return false;
        }
        
        // Store new nonce
        nonces_[nonce] = now;
        return true;
    }
    
    /**
     * Get count of stored nonces (for monitoring)
     */
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return nonces_.size();
    }
    
    /**
     * Force cleanup of expired nonces
     */
    void cleanup() {
        std::lock_guard<std::mutex> lock(mutex_);
        do_cleanup(std::chrono::steady_clock::now());
    }
    
private:
    void maybe_cleanup(std::chrono::steady_clock::time_point now) {
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(
            now - last_cleanup_
        ).count();
        
        if (elapsed >= cleanup_interval_seconds_) {
            do_cleanup(now);
        }
    }
    
    void do_cleanup(std::chrono::steady_clock::time_point now) {
        auto cutoff = now - std::chrono::seconds(expiry_seconds_);
        
        for (auto it = nonces_.begin(); it != nonces_.end(); ) {
            if (it->second < cutoff) {
                it = nonces_.erase(it);
            } else {
                ++it;
            }
        }
        
        last_cleanup_ = now;
    }
    
    int expiry_seconds_;
    int cleanup_interval_seconds_;
    std::unordered_map<std::string, std::chrono::steady_clock::time_point> nonces_;
    std::chrono::steady_clock::time_point last_cleanup_{};
    mutable std::mutex mutex_;
};

} // namespace dbal::security
