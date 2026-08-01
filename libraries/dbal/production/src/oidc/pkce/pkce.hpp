/**
 * @file pkce.hpp
 * @brief PKCE (RFC 7636) validation — S256 only, no "plain" method.
 *
 * Algorithm and bounds verified directly against Keycloak's
 * org.keycloak.protocol.oidc.utils.PkceUtils (charset, 43-128 length,
 * base64url(SHA-256(verifier)) == stored challenge, constant-time compare).
 */
#pragma once

#include "../../security/crypto/sha256.hpp"
#include "../../security/crypto/timing_safe_equal.hpp"
#include "../../security/jwt/base64url.hpp"

#include <regex>
#include <string>

namespace dbal::oidc::pkce {

constexpr size_t kMinCodeVerifierLength = 43;
constexpr size_t kMaxCodeVerifierLength = 128;
constexpr size_t kMinCodeChallengeLength = 43; // base64url(SHA-256) is always 43 chars, but
constexpr size_t kMaxCodeChallengeLength = 128; // validate generously at the /authorize boundary

/// RFC 7636 §4.1 unreserved character set: [A-Za-z0-9-._~]
inline bool isValidCodeVerifierFormat(const std::string& verifier) {
    if (verifier.size() < kMinCodeVerifierLength || verifier.size() > kMaxCodeVerifierLength) {
        return false;
    }
    static const std::regex pattern("^[0-9A-Za-z\\-._~]+$");
    return std::regex_match(verifier, pattern);
}

/// Same charset/length family, used to sanity-check the code_challenge at /authorize.
inline bool isValidCodeChallengeFormat(const std::string& challenge) {
    if (challenge.size() < kMinCodeChallengeLength || challenge.size() > kMaxCodeChallengeLength) {
        return false;
    }
    static const std::regex pattern("^[0-9A-Za-z\\-_]+$"); // base64url alphabet, no '.'/'~'
    return std::regex_match(challenge, pattern);
}

/// S256 challenge derivation: base64url(SHA-256(code_verifier)).
inline std::string deriveS256Challenge(const std::string& codeVerifier) {
    auto digest = dbal::security::sha256_bytes(codeVerifier);
    return dbal::security::base64url_encode(digest);
}

/**
 * @brief Verify a presented code_verifier against a stored S256 challenge.
 *
 * "plain" is never accepted — the caller must have already rejected any
 * code_challenge_method other than "S256" at /authorize time.
 */
inline bool verifyS256(const std::string& codeVerifier, const std::string& storedChallenge) {
    if (!isValidCodeVerifierFormat(codeVerifier)) return false;
    std::string derived = deriveS256Challenge(codeVerifier);
    return dbal::security::timing_safe_equal(derived, storedChallenge);
}

} // namespace dbal::oidc::pkce
