#pragma once
/**
 * @file secure_random_bytes.hpp
 * @brief Cryptographically secure random byte generation
 */

#include <cstddef>
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

} // namespace dbal::security
