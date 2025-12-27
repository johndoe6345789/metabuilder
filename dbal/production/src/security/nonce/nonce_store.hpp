#pragma once
/**
 * @file nonce_store.hpp
 * @brief Nonce storage for replay attack prevention (thread-safe wrapper)
 */

#include <mutex>
#include "nonce_check_and_store.hpp"
#include "nonce_cleanup.hpp"
#include "nonce_maybe_cleanup.hpp"
#include "nonce_size.hpp"

namespace dbal::security {

/**
 * Thread-safe nonce store with automatic expiry
 * Wraps individual nonce functions with mutex protection
 */
class NonceStore {
public:
    explicit NonceStore(int expiry_seconds = 300, int cleanup_interval_seconds = 60) {
        storage_.expiry_seconds = expiry_seconds;
        storage_.cleanup_interval_seconds = cleanup_interval_seconds;
    }
    
    bool check_and_store(const std::string& nonce) {
        std::lock_guard<std::mutex> lock(mutex_);
        nonce_maybe_cleanup(storage_);
        return nonce_check_and_store(storage_, nonce);
    }
    
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return nonce_size(storage_);
    }
    
    void cleanup() {
        std::lock_guard<std::mutex> lock(mutex_);
        nonce_cleanup(storage_);
    }
    
private:
    NonceStorage storage_;
    mutable std::mutex mutex_;
};

} // namespace dbal::security
