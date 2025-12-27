#pragma once
/**
 * @file nonce_maybe_cleanup.hpp
 * @brief Conditional nonce cleanup based on interval
 */

#include "nonce_cleanup.hpp"

namespace dbal::security {

/**
 * Cleanup expired nonces if interval has passed
 * @param storage The nonce storage state
 */
inline void nonce_maybe_cleanup(NonceStorage& storage) {
    auto now = std::chrono::steady_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(
        now - storage.last_cleanup
    ).count();
    
    if (elapsed >= storage.cleanup_interval_seconds) {
        nonce_cleanup(storage);
    }
}

} // namespace dbal::security
