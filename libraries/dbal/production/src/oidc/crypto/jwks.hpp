/**
 * @file jwks.hpp
 * @brief Builds the JSON Web Key Set document served at /oidc/jwks.json.
 */
#pragma once

#include "rsa_keypair.hpp"
#include <nlohmann/json.hpp>

namespace dbal::oidc::crypto {

/**
 * @brief Build a JWKS document (RFC 7517) exposing @p keypair's public key.
 *
 * Single-key set for v1 — no rotation/multi-key story yet (see plan risk
 * notes: replacing the key file is a hard cutover in this version).
 */
inline nlohmann::json buildJwks(const RsaKeypair& keypair) {
    nlohmann::json jwk;
    jwk["kty"] = "RSA";
    jwk["use"] = "sig";
    jwk["alg"] = "RS256";
    jwk["kid"] = keypair.kid();
    jwk["n"] = keypair.modulusB64Url();
    jwk["e"] = keypair.exponentB64Url();

    nlohmann::json doc;
    doc["keys"] = nlohmann::json::array({jwk});
    return doc;
}

} // namespace dbal::oidc::crypto
