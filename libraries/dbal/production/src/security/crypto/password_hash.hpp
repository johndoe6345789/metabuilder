#pragma once
/**
 * @file password_hash.hpp
 * @brief Argon2id password hashing (OWASP 2023 baseline params).
 *
 * Replaces the previous non-cryptographic std::hash-based placeholder in
 * entities/credential/crud/*.hpp (now deleted — see Credential.json /
 * client_misc_ops.cpp for the real implementation this backs).
 */

#include <string>

namespace dbal::security {

/// Hashes @p password with a fresh random salt. Returns Argon2id's
/// self-describing encoded string ($argon2id$v=19$m=...,t=...,p=...$salt$hash)
/// — this is the whole value to store; no separate salt column needed.
std::string hash_password(const std::string& password);

/// Verifies @p password against a previously-stored encoded hash.
/// Constant-time by construction (argon2id_verify recomputes and compares
/// internally) — safe to call directly without an extra timing-safe wrapper.
bool verify_password(const std::string& password, const std::string& encodedHash);

} // namespace dbal::security
