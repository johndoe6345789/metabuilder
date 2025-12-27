#pragma once
/**
 * @file hmac_sha256.hpp
 * @brief HMAC-SHA256 signature computation
 */

#include <string>
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
    
    std::string hex;
    hex.reserve(result_len * 2);
    
    static const char hex_chars[] = "0123456789abcdef";
    for (unsigned int i = 0; i < result_len; ++i) {
        hex += hex_chars[(result[i] >> 4) & 0x0F];
        hex += hex_chars[result[i] & 0x0F];
    }
    
    return hex;
}

} // namespace dbal::security
