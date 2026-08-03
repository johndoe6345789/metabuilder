/**
 * @file token_issuer.hpp
 * @brief Builds and RS256-signs OIDC ID tokens and OAuth2 access tokens.
 *
 * Both are real RS256 JWTs (not opaque) so DBAL can verify its own access
 * tokens locally without a round trip. Claims deliberately keep "tenant_id"
 * as a separate, namespaced custom claim rather than overloading "sub"/"aud"
 * — see server_routes.cpp's tenant cross-check for how it's consumed.
 */
#pragma once

#include "../crypto/rsa_keypair.hpp"
#include <optional>
#include <string>

namespace dbal::oidc::tokens {

struct IdTokenClaims {
    std::string subject;   ///< "sub" — user id
    std::string audience;  ///< "aud" — client_id
    std::string sid;       ///< OIDC session id
    std::string tenantId;
    long long authTime = 0;
    std::optional<std::string> nonce;
    long long ttlSeconds = 900;
};

struct AccessTokenClaims {
    std::string subject;
    std::string audience;
    std::string tenantId;
    std::string scope;
    std::string role;
    long long ttlSeconds = 900;
};

/// Signs an ID token. Throws on signing failure.
std::string issueIdToken(const crypto::RsaKeypair& keypair, const std::string& issuer,
                          const IdTokenClaims& claims);

/// Signs an access token. Throws on signing failure.
std::string issueAccessToken(const crypto::RsaKeypair& keypair, const std::string& issuer,
                              const AccessTokenClaims& claims);

} // namespace dbal::oidc::tokens
