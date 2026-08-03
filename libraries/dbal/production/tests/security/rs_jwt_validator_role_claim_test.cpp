/**
 * @file rs_jwt_validator_role_claim_test.cpp
 * @brief Regression test for role-claim extraction added to RsJwtValidator,
 *        exercised via a real token_issuer->RsJwtValidator round trip (not
 *        a hand-built JWT string) so it also covers the two halves staying
 *        in sync.
 */

#include <gtest/gtest.h>
#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>
#include <filesystem>

#include "oidc/crypto/rsa_keypair.hpp"
#include "oidc/tokens/token_issuer.hpp"
#include "security/jwt/rs_jwt_validator.hpp"

using dbal::oidc::crypto::RsaKeypair;
using dbal::oidc::tokens::AccessTokenClaims;
using dbal::oidc::tokens::issueAccessToken;
using dbal::security::RsJwtValidator;

namespace {
std::string tempKeyPath(const char* name) {
    return (std::filesystem::temp_directory_path() / name).string();
}
constexpr const char* kIssuer = "https://dbal.example.com";
} // namespace

TEST(RsJwtValidatorRoleClaim, ExtractsRoleAlongsideExistingClaims) {
    auto path = tempKeyPath("dbal_test_rs_validator_role.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    AccessTokenClaims claims;
    claims.subject = "alice";
    claims.audience = "pastebin-web";
    claims.tenantId = "pastebin";
    claims.scope = "openid profile";
    claims.role = "admin";
    claims.ttlSeconds = 900;

    std::string token = issueAccessToken(kp, kIssuer, claims);

    RsJwtValidator validator(kp.publicKeyPem(), kIssuer);
    auto result = validator.validate(token);
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->user_id, "alice");
    EXPECT_EQ(result->tenant_id, "pastebin");
    EXPECT_EQ(result->scope, "openid profile");
    EXPECT_EQ(result->role, "admin");

    std::filesystem::remove(path);
}

TEST(RsJwtValidatorRoleClaim, MissingRoleClaimLeavesFieldEmptyNotFatal) {
    // A token from before this change (or any RS256 token from elsewhere
    // that just doesn't set "role") must still validate successfully --
    // role is additive, not required.
    auto path = tempKeyPath("dbal_test_rs_validator_norole.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    auto token = jwt::create<jwt::traits::nlohmann_json>()
        .set_type("JWT")
        .set_key_id(kp.kid())
        .set_issuer(kIssuer)
        .set_subject("legacy-user")
        .set_audience("pastebin-web")
        .set_issued_at(std::chrono::system_clock::now())
        .set_expires_at(std::chrono::system_clock::now() + std::chrono::seconds(900))
        .set_payload_claim("tenant_id", jwt::basic_claim<jwt::traits::nlohmann_json>(std::string("pastebin")))
        .sign(jwt::algorithm::rs256("", kp.privateKeyPem(), "", ""));

    RsJwtValidator validator(kp.publicKeyPem(), kIssuer);
    auto result = validator.validate(token);
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->user_id, "legacy-user");
    EXPECT_TRUE(result->role.empty());

    std::filesystem::remove(path);
}
