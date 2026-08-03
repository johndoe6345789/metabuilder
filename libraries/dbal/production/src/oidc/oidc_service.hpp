/**
 * @file oidc_service.hpp
 * @brief Orchestrates the OIDC Authorization Code + PKCE flow. This is the
 *        only thing the HTTP handlers call into — protocol-shape (query
 *        params, redirects, HTTP status codes) stays in the handlers;
 *        everything security-decision-relevant (validation order, PKCE,
 *        single-use enforcement) lives here so it's testable without Drogon.
 */
#pragma once

#include "clients/oauth_client_config.hpp"
#include "crypto/rsa_keypair.hpp"
#include "crypto/jwks.hpp"
#include "tokens/auth_code_store.hpp"
#include "tokens/refresh_token_store.hpp"
#include "tokens/token_issuer.hpp"
#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"

#include <nlohmann/json.hpp>
#include <optional>
#include <string>

namespace dbal::oidc {

/// Result of a validated /authorize request, ready for either "redirect to
/// login" or "issue a code immediately" depending on session state.
struct AuthorizeRequest {
    std::string clientId;
    std::string redirectUri;
    std::string scope;
    std::string state;
    std::string codeChallenge;
    std::string codeChallengeMethod;
    std::optional<std::string> nonce;
};

/// A browser-level SSO session, distinct from the per-client-exchange
/// OidcSession created in exchangeCode (that one becomes the ID token's
/// "sid" claim). This one is looked up by /authorize on subsequent visits
/// from *other* clients so they can skip the login form. Same OidcSession
/// entity, disambiguated by the reserved clientId "__browser_session__"
/// (never a real registered client_id, so it can't collide).
struct BrowserSession {
    std::string userId;
    std::string tenantId;
};

struct TokenResponse {
    std::string accessToken;
    std::string idToken;
    std::string refreshToken; ///< empty unless the granted scope included "offline_access"
    std::string tokenType = "Bearer";
    long long expiresIn = 0;
    std::string scope;
};

class OidcService {
public:
    OidcService(dbal::Client& client, clients::OAuthClientConfig clientConfig,
                crypto::RsaKeypair keypair, std::string issuer);

    /// RFC 8414 discovery document for /.well-known/openid-configuration.
    nlohmann::json discoveryDocument() const;

    /// RFC 7517 JWKS for /oidc/jwks.json.
    nlohmann::json jwks() const;

    /**
     * @brief Validate an /authorize request per the full checklist (exact
     *        client/redirect_uri match, response_type, S256-only PKCE,
     *        challenge format, scope subset). Returns the error message to
     *        send back (redirected as ?error=... when redirect_uri itself
     *        was valid, or a bare 400 when it wasn't — see handler).
     */
    Result<AuthorizeRequest> validateAuthorize(
        const std::string& clientId, const std::string& redirectUri,
        const std::string& responseType, const std::string& scope,
        const std::string& state, const std::string& codeChallenge,
        const std::string& codeChallengeMethod,
        const std::optional<std::string>& nonce) const;

    /// Creates an OidcSession row after successful login. Returns the sid.
    Result<std::string> createSession(const std::string& userId, const std::string& tenantId,
                                       const std::string& clientId);

    /// Issues a single-use authorization code for an already-authenticated request.
    Result<std::string> issueCode(const AuthorizeRequest& req, const std::string& userId,
                                   const std::string& tenantId);

    /// Creates the browser-level SSO session (reserved sentinel clientId),
    /// set as the dbal_oidc_sid cookie by the login handler. Returns the sid.
    Result<std::string> createBrowserSession(const std::string& userId, const std::string& tenantId);

    /// Looks up a browser-level SSO session by sid (from the cookie). Returns
    /// an error if missing/revoked/expired, or if it isn't actually a
    /// browser-level session (defense against a client-exchange sid ever
    /// being replayed here).
    Result<BrowserSession> lookupBrowserSession(const std::string& sid) const;

    /// Revokes a browser-level SSO session (sets revokedAt) so a subsequent
    /// /authorize call can't resurrect the login. Called by /oidc/logout.
    Result<bool> revokeBrowserSession(const std::string& sid);

    /// Issues a code for an already-authenticated request and builds the
    /// final `redirectUri?code=...&state=...` Location value. Shared by both
    /// the login handler (fresh login) and the authorize handler (session
    /// reuse) so the redirect-assembly logic isn't duplicated between them.
    Result<std::string> buildAuthorizeRedirect(const AuthorizeRequest& req, const std::string& userId,
                                                const std::string& tenantId);

    /**
     * @brief Redeem a code for tokens: redirect_uri exact-match, PKCE
     *        verification, single-use enforcement, then issue access+ID
     *        tokens (refresh token issuance lands in Phase 4).
     */
    Result<TokenResponse> exchangeCode(const std::string& code, const std::string& redirectUri,
                                        const std::string& clientId,
                                        const std::string& codeVerifier);

    /**
     * @brief Redeem a refresh token for a fresh access+ID+refresh token set.
     *        Reuse of an already-rotated token revokes its entire family
     *        (see RefreshTokenStore::rotate) rather than just failing.
     */
    Result<TokenResponse> exchangeRefreshToken(const std::string& refreshToken,
                                                const std::string& clientId);

    /// Revokes a single refresh token (does not touch its rotation family —
    /// see RefreshTokenStore::revoke). Used by /oidc/logout.
    Result<bool> revokeRefreshToken(const std::string& refreshToken);

    const clients::OAuthClientConfig& clientConfig() const { return client_config_; }
    const crypto::RsaKeypair& keypair() const { return keypair_; }
    const std::string& issuer() const { return issuer_; }

private:
    dbal::Client& client_;
    clients::OAuthClientConfig client_config_;
    crypto::RsaKeypair keypair_;
    std::string issuer_;
    tokens::AuthCodeStore auth_code_store_;
    tokens::RefreshTokenStore refresh_token_store_;
};

} // namespace dbal::oidc
