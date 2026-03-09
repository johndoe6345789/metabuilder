#pragma once
/**
 * @file nonce_size.hpp
 * @brief Get nonce storage size
 */

#include "nonce_check_and_store.hpp"

namespace dbal::security {

/**
 * Get number of stored nonces
 * @param storage The nonce storage state
 * @return Count of stored nonces
 */
inline size_t nonce_size(const NonceStorage& storage) {
    return storage.nonces.size();
}

} // namespace dbal::security
