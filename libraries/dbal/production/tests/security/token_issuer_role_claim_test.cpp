/**
 * @file token_issuer_role_claim_test.cpp
 * @brief Regression test for the role claim added to OIDC access tokens.
 */

#include <gtest/gtest.h>
#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>
#include <filesystem>

#include "oidc/crypto/rsa_keypair.hpp"
#include "oidc/tokens/token_issuer.hpp"

using dbal::oidc::crypto::RsaKeypair;
using dbal::oidc::tokens::AccessTokenClaims;
using dbal::oidc::tokens::issueAccessToken;

namespace {
std::string tempKeyPath(const char* name) {
    return (std::filesystem::temp_directory_path() / name).string();
}
} // namespace

TEST(TokenIssuerRoleClaim, AccessTokenCarriesRoleClaim) {
    auto path = tempKeyPath("dbal_test_token_issuer_role.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    AccessTokenClaims claims;
    claims.subject = "alice";
    claims.audience = "pastebin-web";
    claims.tenantId = "pastebin";
    claims.scope = "openid profile offline_access";
    claims.role = "moderator";
    claims.ttlSeconds = 900;

    std::string token = issueAccessToken(kp, "https://dbal.example.com", claims);

    auto decoded = jwt::decode<jwt::traits::nlohmann_json>(token);
    ASSERT_TRUE(decoded.has_payload_claim("role"));
    EXPECT_EQ(decoded.get_payload_claim("role").as_string(), "moderator");

    // Regression: the pre-existing claims must still be present and correct
    // alongside the new one, not displaced by it.
    ASSERT_TRUE(decoded.has_payload_claim("tenant_id"));
    EXPECT_EQ(decoded.get_payload_claim("tenant_id").as_string(), "pastebin");
    ASSERT_TRUE(decoded.has_payload_claim("scope"));
    EXPECT_EQ(decoded.get_payload_claim("scope").as_string(), claims.scope);
    EXPECT_EQ(decoded.get_subject(), "alice");

    std::filesystem::remove(path);
}

TEST(TokenIssuerRoleClaim, EmptyRoleStillProducesAClaim) {
    // Access tokens are always issued with *some* role value (the caller
    // defaults to "user" on lookup failure, see Client::getUserRoleByUsername)
    // -- but the issuer itself doesn't validate non-emptiness, it just emits
    // whatever it's given. Confirms it doesn't crash/omit the claim on "".
    auto path = tempKeyPath("dbal_test_token_issuer_role_empty.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    AccessTokenClaims claims;
    claims.subject = "bob";
    claims.audience = "codegen-web";
    claims.tenantId = "codegen";
    claims.scope = "openid";
    claims.role = "";

    std::string token = issueAccessToken(kp, "https://dbal.example.com", claims);
    auto decoded = jwt::decode<jwt::traits::nlohmann_json>(token);
    ASSERT_TRUE(decoded.has_payload_claim("role"));
    EXPECT_EQ(decoded.get_payload_claim("role").as_string(), "");

    std::filesystem::remove(path);
}
