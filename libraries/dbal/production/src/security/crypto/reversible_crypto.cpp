/**
 * @file reversible_crypto.cpp
 */
#include "reversible_crypto.hpp"
#include "secure_random_bytes.hpp"
#include "../../config/env_parser.hpp"

#include <openssl/evp.h>

#include <memory>
#include <stdexcept>

namespace dbal::security {

namespace {

constexpr int kTagLen = 16;
constexpr int kNonceLen = 12;
constexpr int kKeyLen = 32;
constexpr char kSaltInfo[] = "dbal-encrypted-secret-v1";

using EvpCtxPtr = std::unique_ptr<EVP_CIPHER_CTX, decltype(&EVP_CIPHER_CTX_free)>;

EvpCtxPtr newCtx() {
    EvpCtxPtr ctx(EVP_CIPHER_CTX_new(), &EVP_CIPHER_CTX_free);
    if (!ctx)
        throw std::runtime_error("EVP_CIPHER_CTX_new failed");
    return ctx;
}

const unsigned char* uc(const std::string& s) {
    return reinterpret_cast<const unsigned char*>(s.data());
}

unsigned char* uc(std::string& s) {
    return reinterpret_cast<unsigned char*>(s.data());
}

// Derived once from DBAL_SECRET_ENCRYPTION_KEY and cached for the process
// lifetime -- PBKDF2 at 600k iterations is deliberately slow, and this key
// never changes at runtime.
const std::string& masterKey() {
    static const std::string key = [] {
        const std::string password =
            config::EnvParser::getRequired("DBAL_SECRET_ENCRYPTION_KEY");
        std::string derived(kKeyLen, '\0');
        PKCS5_PBKDF2_HMAC(password.data(), static_cast<int>(password.size()),
                           reinterpret_cast<const unsigned char*>(kSaltInfo),
                           sizeof(kSaltInfo) - 1, 600000, EVP_sha256(),
                           kKeyLen, uc(derived));
        return derived;
    }();
    return key;
}

} // namespace

SealedSecret seal_secret(const std::string& plaintext) {
    SealedSecret out;
    out.nonce.resize(kNonceLen);
    secure_random_bytes(uc(out.nonce), kNonceLen);

    const auto ctx = newCtx();
    const auto& key = masterKey();
    out.ciphertext.resize(plaintext.size() + kTagLen);

    int len = 0;
    EVP_EncryptInit_ex(ctx.get(), EVP_aes_256_gcm(), nullptr, nullptr, nullptr);
    EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_GCM_SET_IVLEN, kNonceLen, nullptr);
    EVP_EncryptInit_ex(ctx.get(), nullptr, nullptr, uc(key), uc(out.nonce));
    EVP_EncryptUpdate(ctx.get(), uc(out.ciphertext), &len, uc(plaintext),
                       static_cast<int>(plaintext.size()));
    int total = len;
    EVP_EncryptFinal_ex(ctx.get(), uc(out.ciphertext) + total, &len);
    total += len;
    EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_GCM_GET_TAG, kTagLen,
                         uc(out.ciphertext) + total);
    return out;
}

std::string open_secret(const SealedSecret& sealed) {
    if (static_cast<int>(sealed.ciphertext.size()) < kTagLen)
        throw std::runtime_error("ciphertext too short");
    const int bodyLen = static_cast<int>(sealed.ciphertext.size()) - kTagLen;

    const auto ctx = newCtx();
    const auto& key = masterKey();
    std::string out(bodyLen, '\0');

    int len = 0;
    EVP_DecryptInit_ex(ctx.get(), EVP_aes_256_gcm(), nullptr, nullptr, nullptr);
    EVP_CIPHER_CTX_ctrl(ctx.get(), EVP_CTRL_GCM_SET_IVLEN, kNonceLen, nullptr);
    EVP_DecryptInit_ex(ctx.get(), nullptr, nullptr, uc(key), uc(sealed.nonce));
    EVP_DecryptUpdate(ctx.get(), uc(out), &len, uc(sealed.ciphertext), bodyLen);
    int total = len;
    EVP_CIPHER_CTX_ctrl(
        ctx.get(), EVP_CTRL_GCM_SET_TAG, kTagLen,
        const_cast<char*>(sealed.ciphertext.data() + bodyLen));
    const int ok = EVP_DecryptFinal_ex(ctx.get(), uc(out) + total, &len);
    if (ok <= 0) {
        throw std::runtime_error(
            "GCM authentication failed (tampered data or wrong key)");
    }
    out.resize(total + len);
    return out;
}

} // namespace dbal::security
