#pragma once

#include <drogon/HttpRequest.h>

#include <optional>
#include <string>

namespace email_backend {

struct AuthResult {
    std::string userId;   // JWT 'sub' claim
    std::string username; // JWT 'username' claim, falls back to 'sub'
};

/// Verifies the caller's DBAL-issued RS256 bearer token against DBAL's
/// published JWKS (fetched from DBAL_OIDC_JWKS_URL, or derived from
/// DBAL_BASE_URL + "/oidc/jwks.json"), checking issuer (DBAL_OIDC_ISSUER)
/// and audience (DBAL_OIDC_CLIENT_ID, default "emailclient-web"). DBAL is
/// the sole identity provider for this backend -- there is no local
/// password auth or HS256 fallback.
std::optional<AuthResult> verifyBearerToken(const drogon::HttpRequestPtr& req);

} // namespace email_backend
