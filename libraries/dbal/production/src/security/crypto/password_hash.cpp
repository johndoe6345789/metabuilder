/**
 * @file password_hash.cpp
 */
#include "password_hash.hpp"
#include "secure_random_bytes.hpp"

#include <argon2.h>
#include <spdlog/spdlog.h>
#include <stdexcept>
#include <vector>

namespace dbal::security {

namespace {
// OWASP 2023 Argon2id baseline: m=19 MiB, t=2, p=1.
constexpr uint32_t kTimeCost = 2;
constexpr uint32_t kMemoryCostKiB = 19 * 1024;
constexpr uint32_t kParallelism = 1;
constexpr uint32_t kHashLength = 32;
constexpr size_t kSaltLength = 16;
} // namespace

std::string hash_password(const std::string& password) {
    std::vector<uint8_t> salt(kSaltLength);
    secure_random_bytes(salt.data(), salt.size());

    size_t encodedLen = argon2_encodedlen(kTimeCost, kMemoryCostKiB, kParallelism,
                                           static_cast<uint32_t>(kSaltLength), kHashLength,
                                           Argon2_id);
    std::vector<char> encoded(encodedLen);

    int rc = argon2id_hash_encoded(kTimeCost, kMemoryCostKiB, kParallelism,
                                    password.data(), password.size(),
                                    salt.data(), salt.size(),
                                    kHashLength, encoded.data(), encoded.size());
    if (rc != ARGON2_OK) {
        throw std::runtime_error(std::string("argon2id_hash_encoded failed: ") +
                                  argon2_error_message(rc));
    }
    return std::string(encoded.data());
}

bool verify_password(const std::string& password, const std::string& encodedHash) {
    if (encodedHash.empty()) return false;
    int rc = argon2id_verify(encodedHash.c_str(), password.data(), password.size());
    if (rc != ARGON2_OK && rc != ARGON2_VERIFY_MISMATCH) {
        spdlog::warn("[password] argon2id_verify unexpected error: {}", argon2_error_message(rc));
    }
    return rc == ARGON2_OK;
}

} // namespace dbal::security
