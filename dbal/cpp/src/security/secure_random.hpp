#pragma once
/**
 * @file secure_random.hpp
 * @brief Cryptographically secure random number generation
 * @details Header-only, uses /dev/urandom or OpenSSL
 */

#include <string>
#include <array>
#include <cstdint>
#include <stdexcept>

#ifdef _WIN32
#include <windows.h>
#include <bcrypt.h>
#pragma comment(lib, "bcrypt.lib")
#else
#include <fstream>
#endif

namespace dbal::security {

/**
 * Generate cryptographically secure random bytes
 * @param buffer Destination buffer
 * @param size Number of bytes to generate
 * @throws std::runtime_error on failure
 */
inline void secure_random_bytes(unsigned char* buffer, size_t size) {
#ifdef _WIN32
    NTSTATUS status = BCryptGenRandom(
        nullptr, buffer, static_cast<ULONG>(size), BCRYPT_USE_SYSTEM_PREFERRED_RNG
    );
    if (!BCRYPT_SUCCESS(status)) {
        throw std::runtime_error("BCryptGenRandom failed");
    }
#else
    std::ifstream urandom("/dev/urandom", std::ios::binary);
    if (!urandom) {
        throw std::runtime_error("Failed to open /dev/urandom");
    }
    urandom.read(reinterpret_cast<char*>(buffer), static_cast<std::streamsize>(size));
    if (!urandom) {
        throw std::runtime_error("Failed to read from /dev/urandom");
    }
#endif
}

/**
 * Generate a secure random hex string
 * @param bytes Number of random bytes (output will be 2x this length)
 * @return Hex-encoded random string
 */
inline std::string secure_random_hex(size_t bytes) {
    std::vector<unsigned char> buffer(bytes);
    secure_random_bytes(buffer.data(), bytes);
    
    static const char hex_chars[] = "0123456789abcdef";
    std::string result;
    result.reserve(bytes * 2);
    
    for (unsigned char b : buffer) {
        result += hex_chars[(b >> 4) & 0x0F];
        result += hex_chars[b & 0x0F];
    }
    
    return result;
}

/**
 * Generate a secure request ID (32 hex chars = 128 bits)
 */
inline std::string generate_request_id() {
    return secure_random_hex(16);
}

/**
 * Generate a secure nonce (32 hex chars = 128 bits)
 */
inline std::string generate_nonce() {
    return secure_random_hex(16);
}

/**
 * Generate a secure token (64 hex chars = 256 bits)
 */
inline std::string generate_token() {
    return secure_random_hex(32);
}

} // namespace dbal::security
