#pragma once
/**
 * @file reversible_crypto.hpp
 * @brief AES-256-GCM reversible secret sealing.
 *
 * For values a caller must later recover in plaintext (e.g. a third-party
 * IMAP/SMTP password an app backend needs to actually log in with) --
 * unlike password_hash.hpp's Argon2id, which only ever verifies and can
 * never be reversed. Backs the EncryptedSecret entity, see
 * daemon/handlers/encrypted_secret_route_handler.hpp.
 *
 * The AES key is derived once (PBKDF2-HMAC-SHA256, 600k iterations) from
 * the required DBAL_SECRET_ENCRYPTION_KEY env var and cached for the life
 * of the process. There is one master key per DBAL deployment, not one
 * per secret or per user, so a fixed application-specific PBKDF2 salt is
 * used rather than a randomly generated one -- the operator-supplied
 * DBAL_SECRET_ENCRYPTION_KEY is the actual secret material; the salt's
 * only job here is domain separation, which a fixed string already gives.
 */

#include <string>

namespace dbal::security {

struct SealedSecret {
    std::string ciphertext; // AES-256-GCM body || 16-byte auth tag
    std::string nonce;      // 12 random bytes, unique per encryption
};

/// Encrypts @p plaintext. Throws std::runtime_error if
/// DBAL_SECRET_ENCRYPTION_KEY is unset or on any OpenSSL failure.
SealedSecret seal_secret(const std::string& plaintext);

/// Decrypts a value previously returned by seal_secret(). Throws
/// std::runtime_error on GCM authentication failure (tampered/corrupt
/// data, or the wrong key) or any other OpenSSL failure.
std::string open_secret(const SealedSecret& sealed);

} // namespace dbal::security
