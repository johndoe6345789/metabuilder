#pragma once
/**
 * @file hmac_signer.hpp
 * @brief HMAC-SHA256 request signing for replay attack prevention
 * @details Header-only, requires OpenSSL
 */

#include <string>
#include <cstring>
#include <stdexcept>
#include <openssl/hmac.h>
#include <openssl/evp.h>

namespace dbal::security {

/**
 * Compute HMAC-SHA256 signature
 * @param key Secret key bytes
 * @param key_len Length of key
 * @param data Data to sign
 * @return Hex-encoded signature
 */
inline std::string hmac_sha256(
    const unsigned char* key, 
    size_t key_len,
    const std::string& data
) {
    unsigned char result[EVP_MAX_MD_SIZE];
    unsigned int result_len = 0;
    
    HMAC(
        EVP_sha256(),
        key, static_cast<int>(key_len),
        reinterpret_cast<const unsigned char*>(data.c_str()), data.size(),
        result, &result_len
    );
    
    // Convert to hex
    std::string hex;
    hex.reserve(result_len * 2);
    
    static const char hex_chars[] = "0123456789abcdef";
    for (unsigned int i = 0; i < result_len; ++i) {
        hex += hex_chars[(result[i] >> 4) & 0x0F];
        hex += hex_chars[result[i] & 0x0F];
    }
    
    return hex;
}

/**
 * Timing-safe string comparison (prevents timing attacks)
 * @param a First string
 * @param b Second string
 * @return true if equal
 */
inline bool timing_safe_equal(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) {
        return false;
    }
    
    volatile unsigned char result = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        result |= static_cast<unsigned char>(a[i]) ^ static_cast<unsigned char>(b[i]);
    }
    
    return result == 0;
}

} // namespace dbal::security
