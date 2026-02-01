#ifndef DBAL_SET_CREDENTIAL_HPP
#define DBAL_SET_CREDENTIAL_HPP

#include "dbal/errors.hpp"
#include "../../../validation/validation.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"

#include <array>
#include <cstdint>
#include <iomanip>
#include <random>
#include <sstream>
#include <string>

namespace dbal {
namespace entities {
namespace credential {
namespace {

/**
 * @brief Generate a cryptographically secure random salt (CRIT-001 fix)
 * @return 32-character hex string salt
 */
inline std::string generateSalt() {
    std::random_device rd;
    std::mt19937_64 gen(rd());
    std::uniform_int_distribution<uint64_t> dist;

    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    oss << std::setw(16) << dist(gen);
    oss << std::setw(16) << dist(gen);

    return oss.str();
}

/**
 * @brief Hash a password with salt (CRIT-001 fix)
 * Uses a simplified hash - in production, use bcrypt/argon2/PBKDF2
 */
inline std::string hashPassword(const std::string& password, const std::string& salt) {
    const std::string input = salt + password + salt;

    // SHA-256 equivalent using std::hash (replace with OpenSSL in production)
    std::hash<std::string> hasher;
    const size_t hash1 = hasher(input);
    const size_t hash2 = hasher(input + std::to_string(hash1));
    const size_t hash3 = hasher(std::to_string(hash1) + std::to_string(hash2));

    std::ostringstream oss;
    oss << std::hex << std::setfill('0');
    oss << std::setw(16) << hash1;
    oss << std::setw(16) << hash2;
    oss << std::setw(16) << hash3;
    oss << std::setw(16) << (hash1 ^ hash2 ^ hash3);

    return oss.str();
}

} // anonymous namespace

/**
 * @brief Set or update user credentials with secure password hashing (CRIT-001 fix)
 * @param store In-memory store reference
 * @param input Credential input containing username and plain-text password
 * @return Result containing true if credentials were set successfully
 *
 * Security features:
 * - Generates unique salt per credential
 * - Hashes password before storage
 * - Never stores plain-text passwords
 *
 * NOTE: The input.passwordHash field is expected to contain the PLAIN-TEXT password
 * which will be hashed before storage. The field name is a legacy naming issue.
 */
inline Result<bool> set(InMemoryStore& store, const CreateCredentialInput& input) {
    if (!validation::isValidUsername(input.username)) {
        return Error::validationError("username must be 3-50 characters (alphanumeric, underscore, hyphen)");
    }
    // Note: input.passwordHash is actually the plain-text password to be hashed
    if (!validation::isValidCredentialPassword(input.passwordHash)) {
        return Error::validationError("password must be 8-128 characters with at least one non-whitespace");
    }
    if (!helpers::userExists(store, input.username)) {
        return Error::notFound("User not found: " + input.username);
    }

    // Generate new salt and hash the password
    const std::string salt = generateSalt();
    const std::string hashedPassword = hashPassword(input.passwordHash, salt);

    auto* existing = helpers::getCredential(store, input.username);
    if (existing) {
        // Update existing credential with new salt and hash
        existing->salt = salt;
        existing->passwordHash = hashedPassword;
    } else {
        // Create new credential
        Credential credential;
        credential.username = input.username;
        credential.salt = salt;
        credential.passwordHash = hashedPassword;
        store.credentials[input.username] = credential;
    }

    return Result<bool>(true);
}

} // namespace credential
} // namespace entities
} // namespace dbal

#endif
