/**
 * @file rsa_keypair.cpp
 * @brief RSA-2048 keypair generation/loading implementation (OpenSSL 3.x EVP API).
 */
#include "rsa_keypair.hpp"
#include "../../security/jwt/base64url.hpp"
#include "../../security/crypto/sha256.hpp"

#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/bio.h>
#include <openssl/core_names.h>
#include <openssl/param_build.h>

#include <spdlog/spdlog.h>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <vector>

namespace dbal::oidc::crypto {

namespace {

std::string bioToString(BIO* bio) {
    char* data = nullptr;
    long len = BIO_get_mem_data(bio, &data);
    if (len < 0 || !data) return {};
    return std::string(data, static_cast<size_t>(len));
}

// BIGNUM -> big-endian raw bytes -> base64url, as JWKS requires for "n"/"e".
std::string bignumToB64Url(const BIGNUM* bn) {
    int size = BN_num_bytes(bn);
    std::vector<uint8_t> buf(static_cast<size_t>(size));
    BN_bn2bin(bn, buf.data());
    return dbal::security::base64url_encode(buf);
}

} // namespace

RsaKeypair::RsaKeypair(const std::string& pemPath) {
    if (std::filesystem::exists(pemPath)) {
        spdlog::warn("[oidc] Loading existing RSA signing key from {}", pemPath);
        loadFromFile(pemPath);
    } else {
        spdlog::warn(
            "[oidc] No RSA signing key found at {} — GENERATING A NEW ONE. "
            "If this path is not on a persistent volume, every outstanding "
            "OIDC token will be invalidated on the next container restart.",
            pemPath);
        generateAndPersist(pemPath);
    }
    deriveDerivedFields();
}

void RsaKeypair::generateAndPersist(const std::string& pemPath) {
    EVP_PKEY_CTX* pctx = EVP_PKEY_CTX_new_from_name(nullptr, "RSA", nullptr);
    if (!pctx) throw std::runtime_error("EVP_PKEY_CTX_new_from_name(RSA) failed");

    EVP_PKEY* pkey = nullptr;
    if (EVP_PKEY_keygen_init(pctx) != 1 ||
        EVP_PKEY_CTX_set_rsa_keygen_bits(pctx, 2048) != 1 ||
        EVP_PKEY_generate(pctx, &pkey) != 1) {
        EVP_PKEY_CTX_free(pctx);
        throw std::runtime_error("RSA-2048 key generation failed");
    }
    EVP_PKEY_CTX_free(pctx);

    BIO* priv_bio = BIO_new(BIO_s_mem());
    BIO* pub_bio = BIO_new(BIO_s_mem());
    if (!priv_bio || !pub_bio) {
        EVP_PKEY_free(pkey);
        throw std::runtime_error("BIO_new failed");
    }

    bool ok = PEM_write_bio_PrivateKey(priv_bio, pkey, nullptr, nullptr, 0, nullptr, nullptr) == 1 &&
              PEM_write_bio_PUBKEY(pub_bio, pkey) == 1;
    if (!ok) {
        BIO_free(priv_bio);
        BIO_free(pub_bio);
        EVP_PKEY_free(pkey);
        throw std::runtime_error("PEM_write_bio failed for generated RSA key");
    }

    private_key_pem_ = bioToString(priv_bio);
    public_key_pem_ = bioToString(pub_bio);
    BIO_free(priv_bio);
    BIO_free(pub_bio);
    EVP_PKEY_free(pkey);

    // Persist private key with 0600 perms *before* the world-readable default
    // a plain ofstream would otherwise leave briefly on POSIX.
    std::filesystem::path path(pemPath);
    if (path.has_parent_path()) {
        std::filesystem::create_directories(path.parent_path());
    }
    {
        std::ofstream out(pemPath, std::ios::binary | std::ios::trunc);
        if (!out) throw std::runtime_error("Failed to open " + pemPath + " for writing");
        out << private_key_pem_;
    }
    std::error_code ec;
    std::filesystem::permissions(
        pemPath,
        std::filesystem::perms::owner_read | std::filesystem::perms::owner_write,
        std::filesystem::perm_options::replace, ec);
    if (ec) {
        spdlog::warn("[oidc] Could not chmod 0600 on {}: {}", pemPath, ec.message());
    }

    spdlog::info("[oidc] Generated and persisted a new RSA-2048 signing key at {}", pemPath);
}

void RsaKeypair::loadFromFile(const std::string& pemPath) {
    std::ifstream in(pemPath, std::ios::binary);
    if (!in) throw std::runtime_error("Failed to open " + pemPath + " for reading");
    std::string pem((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());
    if (pem.empty()) throw std::runtime_error("RSA key file is empty: " + pemPath);

    BIO* bio = BIO_new_mem_buf(pem.data(), static_cast<int>(pem.size()));
    if (!bio) throw std::runtime_error("BIO_new_mem_buf failed");

    EVP_PKEY* pkey = PEM_read_bio_PrivateKey(bio, nullptr, nullptr, nullptr);
    BIO_free(bio);
    if (!pkey) throw std::runtime_error("Failed to parse RSA private key from " + pemPath);

    BIO* pub_bio = BIO_new(BIO_s_mem());
    if (!pub_bio || PEM_write_bio_PUBKEY(pub_bio, pkey) != 1) {
        if (pub_bio) BIO_free(pub_bio);
        EVP_PKEY_free(pkey);
        throw std::runtime_error("Failed to derive public key from " + pemPath);
    }

    private_key_pem_ = pem;
    public_key_pem_ = bioToString(pub_bio);
    BIO_free(pub_bio);
    EVP_PKEY_free(pkey);
}

void RsaKeypair::deriveDerivedFields() {
    BIO* bio = BIO_new_mem_buf(public_key_pem_.data(), static_cast<int>(public_key_pem_.size()));
    if (!bio) throw std::runtime_error("BIO_new_mem_buf failed for public key");
    EVP_PKEY* pkey = PEM_read_bio_PUBKEY(bio, nullptr, nullptr, nullptr);
    BIO_free(bio);
    if (!pkey) throw std::runtime_error("Failed to parse derived public key");

    BIGNUM* n = nullptr;
    BIGNUM* e = nullptr;
    bool ok = EVP_PKEY_get_bn_param(pkey, OSSL_PKEY_PARAM_RSA_N, &n) == 1 &&
              EVP_PKEY_get_bn_param(pkey, OSSL_PKEY_PARAM_RSA_E, &e) == 1;
    if (!ok) {
        if (n) BN_free(n);
        if (e) BN_free(e);
        EVP_PKEY_free(pkey);
        throw std::runtime_error("Failed to extract RSA modulus/exponent");
    }

    modulus_b64url_ = bignumToB64Url(n);
    exponent_b64url_ = bignumToB64Url(e);
    BN_free(n);
    BN_free(e);

    // kid = SHA-256 of the DER-encoded SubjectPublicKeyInfo. Deterministic
    // per key, changes iff the key changes — no coordination needed.
    unsigned char* der = nullptr;
    int der_len = i2d_PUBKEY(pkey, &der);
    EVP_PKEY_free(pkey);
    if (der_len <= 0 || !der) {
        throw std::runtime_error("i2d_PUBKEY failed while deriving kid");
    }
    kid_ = dbal::security::sha256_hex(std::string(reinterpret_cast<char*>(der), static_cast<size_t>(der_len)))
               .substr(0, 16);
    OPENSSL_free(der);
}

} // namespace dbal::oidc::crypto
