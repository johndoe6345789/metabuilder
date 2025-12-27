#pragma once
/**
 * @file nonce_check_and_store.hpp
 * @brief Nonce validation and storage
 */

#include <string>
#include <unordered_map>
#include <chrono>

namespace dbal::security {

/**
 * Nonce storage state
 */
struct NonceStorage {
    std::unordered_map<std::string, std::chrono::steady_clock::time_point> nonces;
    std::chrono::steady_clock::time_point last_cleanup{};
    int expiry_seconds = 300;
    int cleanup_interval_seconds = 60;
};

/**
 * Check if nonce is fresh and store it
 * @param storage The nonce storage state
 * @param nonce The nonce to check
 * @return true if fresh (not seen before), false if replay
 */
inline bool nonce_check_and_store(NonceStorage& storage, const std::string& nonce) {
    auto now = std::chrono::steady_clock::now();
    
    // Check if already exists
    auto it = storage.nonces.find(nonce);
    if (it != storage.nonces.end()) {
        return false;  // Replay detected
    }
    
    // Store new nonce
    storage.nonces[nonce] = now;
    return true;
}

} // namespace dbal::security
