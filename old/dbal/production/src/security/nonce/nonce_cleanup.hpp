#pragma once
/**
 * @file nonce_cleanup.hpp
 * @brief Expired nonce cleanup
 */

#include "nonce_check_and_store.hpp"

namespace dbal::security {

/**
 * Remove expired nonces from storage
 * @param storage The nonce storage state
 */
inline void nonce_cleanup(NonceStorage& storage) {
    auto now = std::chrono::steady_clock::now();
    auto cutoff = now - std::chrono::seconds(storage.expiry_seconds);
    
    for (auto it = storage.nonces.begin(); it != storage.nonces.end(); ) {
        if (it->second < cutoff) {
            it = storage.nonces.erase(it);
        } else {
            ++it;
        }
    }
    
    storage.last_cleanup = now;
}

} // namespace dbal::security
