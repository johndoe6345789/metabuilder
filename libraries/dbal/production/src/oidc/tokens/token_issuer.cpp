/**
 * @file token_issuer.cpp
 */
#include "token_issuer.hpp"
#include "../../security/tokens/generate_token.hpp"

#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>
#include <chrono>

namespace dbal::oidc::tokens {

using Traits = jwt::traits::nlohmann_json;

std::string issueIdToken(const crypto::RsaKeypair& keypair, const std::string& issuer,
                          const IdTokenClaims& claims) {
    auto now = std::chrono::system_clock::now();
    auto builder = jwt::create<Traits>()
        .set_type("JWT")
        .set_key_id(keypair.kid())
        .set_issuer(issuer)
        .set_subject(claims.subject)
        .set_audience(claims.audience)
        .set_issued_at(now)
        .set_expires_at(now + std::chrono::seconds(claims.ttlSeconds))
        .set_id(dbal::security::generate_token())
        .set_payload_claim("sid", jwt::basic_claim<Traits>(claims.sid))
        .set_payload_claim("tenant_id", jwt::basic_claim<Traits>(claims.tenantId))
        .set_payload_claim("auth_time", jwt::basic_claim<Traits>(
            static_cast<int64_t>(claims.authTime)));

    if (claims.nonce) {
        builder.set_payload_claim("nonce", jwt::basic_claim<Traits>(*claims.nonce));
    }

    return builder.sign(jwt::algorithm::rs256("", keypair.privateKeyPem(), "", ""));
}

std::string issueAccessToken(const crypto::RsaKeypair& keypair, const std::string& issuer,
                              const AccessTokenClaims& claims) {
    auto now = std::chrono::system_clock::now();
    auto builder = jwt::create<Traits>()
        .set_type("JWT")
        .set_key_id(keypair.kid())
        .set_issuer(issuer)
        .set_subject(claims.subject)
        .set_audience(claims.audience)
        .set_issued_at(now)
        .set_expires_at(now + std::chrono::seconds(claims.ttlSeconds))
        .set_id(dbal::security::generate_token())
        .set_payload_claim("tenant_id", jwt::basic_claim<Traits>(claims.tenantId))
        .set_payload_claim("scope", jwt::basic_claim<Traits>(claims.scope))
        .set_payload_claim("role", jwt::basic_claim<Traits>(claims.role));

    return builder.sign(jwt::algorithm::rs256("", keypair.privateKeyPem(), "", ""));
}

} // namespace dbal::oidc::tokens
