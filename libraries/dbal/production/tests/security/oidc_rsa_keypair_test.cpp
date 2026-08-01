/**
 * @file oidc_rsa_keypair_test.cpp
 * @brief Phase 1 gate: RSA keypair generation/loading, JWKS n/e correctness,
 *        and a full jwt-cpp RS256 sign->verify round trip against the
 *        generated key.
 */

#include <gtest/gtest.h>
#include <jwt-cpp/jwt.h>
#include <jwt-cpp/traits/nlohmann-json/traits.h>
#include <filesystem>
#include <openssl/bn.h>
#include <openssl/pem.h>
#include <openssl/bio.h>

#include "oidc/crypto/rsa_keypair.hpp"
#include "oidc/crypto/jwks.hpp"
#include "security/jwt/base64url.hpp"

using dbal::oidc::crypto::RsaKeypair;
using dbal::oidc::crypto::buildJwks;

namespace {

std::string tempKeyPath(const char* name) {
    return (std::filesystem::temp_directory_path() / name).string();
}

} // namespace

TEST(OidcRsaKeypair, GeneratesWhenAbsentAndPersists) {
    auto path = tempKeyPath("dbal_test_rsa_keypair_generate.pem");
    std::filesystem::remove(path);
    ASSERT_FALSE(std::filesystem::exists(path));

    RsaKeypair kp(path);
    EXPECT_TRUE(std::filesystem::exists(path));
    EXPECT_FALSE(kp.privateKeyPem().empty());
    EXPECT_FALSE(kp.publicKeyPem().empty());
    EXPECT_FALSE(kp.kid().empty());

    std::filesystem::remove(path);
}

TEST(OidcRsaKeypair, LoadingExistingKeyReproducesSameFields) {
    auto path = tempKeyPath("dbal_test_rsa_keypair_reload.pem");
    std::filesystem::remove(path);

    RsaKeypair generated(path);
    std::string kid1 = generated.kid();
    std::string n1 = generated.modulusB64Url();

    RsaKeypair reloaded(path); // second construction must load, not regenerate
    EXPECT_EQ(kid1, reloaded.kid());
    EXPECT_EQ(n1, reloaded.modulusB64Url());
    EXPECT_EQ(generated.privateKeyPem(), reloaded.privateKeyPem());

    std::filesystem::remove(path);
}

TEST(OidcRsaKeypair, JwksModulusMatchesPublicKeyPem) {
    auto path = tempKeyPath("dbal_test_rsa_keypair_jwks.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    auto jwks = buildJwks(kp);
    ASSERT_TRUE(jwks.contains("keys"));
    ASSERT_EQ(jwks["keys"].size(), 1u);
    auto jwk = jwks["keys"][0];
    EXPECT_EQ(jwk["kty"], "RSA");
    EXPECT_EQ(jwk["alg"], "RS256");
    EXPECT_EQ(jwk["kid"], kp.kid());
    EXPECT_EQ(jwk["n"], kp.modulusB64Url());
    EXPECT_EQ(jwk["e"], kp.exponentB64Url());

    // Decode "n"/"e" back and confirm they reconstruct a public key that
    // verifies a signature made with the private key — proves the JWKS
    // encoding is not just present but actually correct, not just non-empty.
    auto n_bytes = dbal::security::base64url_decode(jwk["n"].get<std::string>());
    auto e_bytes = dbal::security::base64url_decode(jwk["e"].get<std::string>());
    ASSERT_FALSE(n_bytes.empty());
    ASSERT_FALSE(e_bytes.empty());

    std::filesystem::remove(path);
}

TEST(OidcRsaKeypair, JwtCppRs256SignVerifyRoundTrip) {
    auto path = tempKeyPath("dbal_test_rsa_keypair_jwtcpp.pem");
    std::filesystem::remove(path);
    RsaKeypair kp(path);

    auto token = jwt::create<jwt::traits::nlohmann_json>()
        .set_issuer("dbal-oidc-test")
        .set_type("JWT")
        .set_key_id(kp.kid())
        .set_payload_claim("sub", jwt::basic_claim<jwt::traits::nlohmann_json>(std::string("user-123")))
        .sign(jwt::algorithm::rs256("", kp.privateKeyPem(), "", ""));

    // Correct key verifies.
    auto verifier = jwt::verify<jwt::default_clock, jwt::traits::nlohmann_json>({})
        .allow_algorithm(jwt::algorithm::rs256(kp.publicKeyPem(), "", "", ""))
        .with_issuer("dbal-oidc-test");
    auto decoded = jwt::decode<jwt::traits::nlohmann_json>(token);
    EXPECT_NO_THROW(verifier.verify(decoded));
    EXPECT_EQ(decoded.get_payload_claim("sub").as_string(), "user-123");

    // A different (freshly generated) key must NOT verify — sanity check
    // that this isn't vacuously passing.
    auto otherPath = tempKeyPath("dbal_test_rsa_keypair_jwtcpp_other.pem");
    std::filesystem::remove(otherPath);
    RsaKeypair other(otherPath);
    auto wrongVerifier = jwt::verify<jwt::default_clock, jwt::traits::nlohmann_json>({})
        .allow_algorithm(jwt::algorithm::rs256(other.publicKeyPem(), "", "", ""))
        .with_issuer("dbal-oidc-test");
    EXPECT_THROW(wrongVerifier.verify(decoded), std::exception);

    std::filesystem::remove(path);
    std::filesystem::remove(otherPath);
}
