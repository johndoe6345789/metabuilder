#pragma once

#include <optional>
#include <string>
#include <utility>

namespace email_backend {

/// Finds `kid` in a raw JWKS JSON document and returns its RSA modulus
/// (n) and exponent (e) as base64url strings, per RFC 7517.
std::optional<std::pair<std::string, std::string>> findJwkNE(
    const std::string& jwksText, const std::string& kid);

/// Builds a PEM-encoded RSA public key from base64url-encoded n/e values.
std::optional<std::string> rsaPemFromNE(const std::string& nB64Url,
                                         const std::string& eB64Url);

} // namespace email_backend
