/**
 * @file reversible_crypto_test.cpp
 * @brief Unit tests for AES-256-GCM reversible secret sealing.
 */

#include <gtest/gtest.h>

#include <cstdlib>

#include "security/crypto/reversible_crypto.hpp"

using dbal::security::open_secret;
using dbal::security::seal_secret;
using dbal::security::SealedSecret;

namespace {

class ReversibleCryptoTest : public ::testing::Test {
  protected:
    static void SetUpTestSuite() {
        setenv("DBAL_SECRET_ENCRYPTION_KEY",
               "test-only-master-key-do-not-use-in-production", 1);
    }
};

} // namespace

TEST_F(ReversibleCryptoTest, RoundTripReturnsOriginalPlaintext) {
    const std::string plaintext = "s3cr3t-imap-password!";
    const auto sealed = seal_secret(plaintext);
    EXPECT_EQ(open_secret(sealed), plaintext);
}

TEST_F(ReversibleCryptoTest, CiphertextDoesNotContainPlaintext) {
    const std::string plaintext = "s3cr3t-imap-password!";
    const auto sealed = seal_secret(plaintext);
    EXPECT_EQ(sealed.ciphertext.find(plaintext), std::string::npos);
}

TEST_F(ReversibleCryptoTest, EmptyPlaintextRoundTrips) {
    const auto sealed = seal_secret("");
    EXPECT_EQ(open_secret(sealed), "");
}

TEST_F(ReversibleCryptoTest, SameInputProducesDifferentNonceAndCiphertext) {
    const std::string plaintext = "same-input-twice";
    const auto first = seal_secret(plaintext);
    const auto second = seal_secret(plaintext);
    EXPECT_NE(first.nonce, second.nonce);
    EXPECT_NE(first.ciphertext, second.ciphertext);
    EXPECT_EQ(open_secret(first), plaintext);
    EXPECT_EQ(open_secret(second), plaintext);
}

TEST_F(ReversibleCryptoTest, TamperedCiphertextFailsAuthentication) {
    auto sealed = seal_secret("do-not-tamper-with-me");
    sealed.ciphertext[0] ^= 0xFF;
    EXPECT_THROW(open_secret(sealed), std::runtime_error);
}

TEST_F(ReversibleCryptoTest, TamperedNonceFailsAuthentication) {
    auto sealed = seal_secret("do-not-tamper-with-me");
    sealed.nonce[0] ^= 0xFF;
    EXPECT_THROW(open_secret(sealed), std::runtime_error);
}

TEST_F(ReversibleCryptoTest, TruncatedCiphertextThrows) {
    SealedSecret sealed;
    sealed.nonce = std::string(12, '\0');
    sealed.ciphertext = "short";
    EXPECT_THROW(open_secret(sealed), std::runtime_error);
}
