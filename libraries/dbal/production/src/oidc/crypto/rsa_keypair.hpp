/**
 * @file rsa_keypair.hpp
 * @brief RSA-2048 signing keypair for the OIDC token issuer.
 *
 * Loads an existing PEM keypair from disk if present, otherwise generates
 * a fresh RSA-2048 key and writes it out. The key file is a stateful secret:
 * it MUST be volume-mounted in deployment, never baked into the image. Losing
 * it (or the container regenerating a new one because the mount is missing)
 * silently invalidates every outstanding token and the JWKS `kid` — this
 * class logs loudly to distinguish "loaded existing key" from "generated a
 * new key" so that failure mode is observable rather than silent.
 */
#pragma once

#include <string>

namespace dbal::oidc::crypto {

/**
 * @brief RSA-2048 keypair used to sign/verify OIDC tokens (RS256).
 */
class RsaKeypair {
public:
    /**
     * @brief Load the keypair from @p pemPath, generating and persisting a
     *        new RSA-2048 key there if the file does not exist.
     * @throws std::runtime_error on OpenSSL failure or an unwritable path.
     */
    explicit RsaKeypair(const std::string& pemPath);

    /// PEM-encoded private key (PKCS#8), for jwt-cpp's rs256(pub, priv) signer.
    const std::string& privateKeyPem() const { return private_key_pem_; }

    /// PEM-encoded public key (SubjectPublicKeyInfo), for jwt-cpp verification.
    const std::string& publicKeyPem() const { return public_key_pem_; }

    /// Key ID: hex SHA-256 of the DER-encoded public key. Changes iff the key changes.
    const std::string& kid() const { return kid_; }

    /// Base64url-encoded RSA modulus (JWKS "n").
    const std::string& modulusB64Url() const { return modulus_b64url_; }

    /// Base64url-encoded RSA public exponent (JWKS "e").
    const std::string& exponentB64Url() const { return exponent_b64url_; }

private:
    void generateAndPersist(const std::string& pemPath);
    void loadFromFile(const std::string& pemPath);
    void deriveDerivedFields(); // kid + JWKS n/e, computed once after load/generate

    std::string private_key_pem_;
    std::string public_key_pem_;
    std::string kid_;
    std::string modulus_b64url_;
    std::string exponent_b64url_;
};

} // namespace dbal::oidc::crypto
