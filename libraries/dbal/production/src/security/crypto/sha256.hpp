#pragma once
/**
 * @file sha256.hpp
 * @brief SHA-256 digest computation (raw bytes and hex), shared by PKCE
 *        verification and opaque-token hashing (auth codes, refresh tokens,
 *        CAS tickets — never store the raw secret, only its hash).
 */

#include <string>
#include <vector>
#include <cstdint>
#include <stdexcept>
#include <openssl/evp.h>

namespace dbal::security {

inline std::vector<uint8_t> sha256_bytes(const std::string& data) {
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int digest_len = 0;
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    if (!ctx) throw std::runtime_error("EVP_MD_CTX_new failed");
    bool ok = EVP_DigestInit_ex(ctx, EVP_sha256(), nullptr) == 1 &&
              EVP_DigestUpdate(ctx, data.data(), data.size()) == 1 &&
              EVP_DigestFinal_ex(ctx, digest, &digest_len) == 1;
    EVP_MD_CTX_free(ctx);
    if (!ok) throw std::runtime_error("SHA-256 digest failed");
    return std::vector<uint8_t>(digest, digest + digest_len);
}

inline std::string sha256_hex(const std::string& data) {
    auto bytes = sha256_bytes(data);
    static const char hex_chars[] = "0123456789abcdef";
    std::string hex;
    hex.reserve(bytes.size() * 2);
    for (uint8_t b : bytes) {
        hex += hex_chars[(b >> 4) & 0x0F];
        hex += hex_chars[b & 0x0F];
    }
    return hex;
}

} // namespace dbal::security
