/**
 * @file oidc_service.cpp
 */
#include "oidc_service.hpp"
#include "pkce/pkce.hpp"

#include <chrono>
#include <spdlog/spdlog.h>

namespace dbal::oidc {

namespace {
long long nowUnix() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}

// Reserved clientId for browser-level SSO sessions (see BrowserSession in
// the header) -- never a real registered client_id, so it can't collide
// with one from clients.json.
constexpr const char* kBrowserSessionClientId = "__browser_session__";

// Space-delimited scope membership check (word-boundary safe — unlike a raw
// substring search, "offline_accessfoo" doesn't false-match "offline_access").
bool scopeContains(const std::string& scope, const std::string& token) {
    size_t start = 0;
    while (start <= scope.size()) {
        size_t sp = scope.find(' ', start);
        if (sp == std::string::npos) sp = scope.size();
        if (scope.compare(start, sp - start, token) == 0) return true;
        start = sp + 1;
    }
    return false;
}
} // namespace

OidcService::OidcService(dbal::Client& client, clients::OAuthClientConfig clientConfig,
                          crypto::RsaKeypair keypair, std::string issuer)
    : client_(client),
      client_config_(std::move(clientConfig)),
      keypair_(std::move(keypair)),
      issuer_(std::move(issuer)),
      auth_code_store_(client_, /*ttlSeconds=*/60),
      refresh_token_store_(client_) {}

nlohmann::json OidcService::discoveryDocument() const {
    nlohmann::json doc;
    doc["issuer"] = issuer_;
    doc["authorization_endpoint"] = issuer_ + "/oidc/authorize";
    doc["token_endpoint"] = issuer_ + "/oidc/token";
    doc["userinfo_endpoint"] = issuer_ + "/oidc/userinfo";
    doc["jwks_uri"] = issuer_ + "/oidc/jwks.json";
    doc["end_session_endpoint"] = issuer_ + "/oidc/logout";
    doc["response_types_supported"] = {"code"};
    doc["grant_types_supported"] = {"authorization_code", "refresh_token"};
    doc["subject_types_supported"] = {"public"};
    doc["id_token_signing_alg_values_supported"] = {"RS256"};
    doc["scopes_supported"] = {"openid", "profile", "email", "offline_access"};
    doc["token_endpoint_auth_methods_supported"] = {"none"};
    doc["code_challenge_methods_supported"] = {"S256"};
    return doc;
}

nlohmann::json OidcService::jwks() const {
    return crypto::buildJwks(keypair_);
}

Result<AuthorizeRequest> OidcService::validateAuthorize(
    const std::string& clientId, const std::string& redirectUri,
    const std::string& responseType, const std::string& scope,
    const std::string& state, const std::string& codeChallenge,
    const std::string& codeChallengeMethod,
    const std::optional<std::string>& nonce) const {

    // 1. client_id must exist. Don't redirect yet — redirect_uri isn't
    //    trusted until we know it belongs to this client_id.
    auto client = client_config_.get(clientId);
    if (!client) {
        return Error::validationError("invalid_client: unknown client_id");
    }

    // 2. redirect_uri must EXACT-MATCH one registered for this client. Still
    //    don't redirect — an unregistered redirect_uri is never trusted.
    if (!client->isValidRedirectUri(redirectUri)) {
        return Error::validationError("invalid_request: redirect_uri not registered for this client");
    }

    // From here on redirect_uri is trusted, so validation failures could in
    // principle redirect with ?error=..., but this method just reports the
    // failure — the handler decides whether/how to redirect.

    // 3. response_type must be "code" — this provider only implements the
    //    Authorization Code flow.
    if (responseType != "code") {
        return Error::validationError("unsupported_response_type");
    }

    // 4. S256 only. "plain" (or anything else) is rejected outright.
    if (codeChallengeMethod != "S256") {
        return Error::validationError("invalid_request: code_challenge_method must be S256");
    }

    // 5. code_challenge format sanity (43-128 chars, base64url alphabet).
    if (!pkce::isValidCodeChallengeFormat(codeChallenge)) {
        return Error::validationError("invalid_request: malformed code_challenge");
    }

    // 6. requested scope must be a subset of what this client is configured for.
    if (!client->isScopeAllowed(scope)) {
        return Error::validationError("invalid_scope");
    }

    AuthorizeRequest req;
    req.clientId = clientId;
    req.redirectUri = redirectUri;
    req.scope = scope;
    req.state = state;
    req.codeChallenge = codeChallenge;
    req.codeChallengeMethod = codeChallengeMethod;
    req.nonce = nonce;
    return req;
}

Result<std::string> OidcService::createSession(const std::string& userId, const std::string& tenantId,
                                                const std::string& clientId) {
    nlohmann::json data;
    data["userId"] = userId;
    data["tenantId"] = tenantId;
    data["clientId"] = clientId;
    data["authTime"] = nowUnix();
    data["revokedAt"] = nullptr;
    // Absolute session ceiling — independent of individual token TTLs.
    // 12 hours is a reasonable default for a home-lab; not yet configurable.
    data["expiresAt"] = nowUnix() + (12 * 3600);
    data["createdAt"] = nowUnix();

    auto result = client_.createEntity("OidcSession", data);
    if (result.isError()) {
        return result.error();
    }
    std::string sid = result.value().value("id", std::string());
    if (sid.empty()) {
        return Error::internal("OidcSession created but no id returned");
    }
    return sid;
}

Result<std::string> OidcService::issueCode(const AuthorizeRequest& req, const std::string& userId,
                                            const std::string& tenantId) {
    tokens::AuthorizationCodeRequest codeReq;
    codeReq.clientId = req.clientId;
    codeReq.userId = userId;
    codeReq.tenantId = tenantId;
    codeReq.redirectUri = req.redirectUri;
    codeReq.codeChallenge = req.codeChallenge;
    codeReq.codeChallengeMethod = req.codeChallengeMethod;
    codeReq.scope = req.scope;
    codeReq.nonce = req.nonce;
    return auth_code_store_.issue(codeReq);
}

Result<std::string> OidcService::createBrowserSession(const std::string& userId,
                                                        const std::string& tenantId) {
    return createSession(userId, tenantId, kBrowserSessionClientId);
}

Result<BrowserSession> OidcService::lookupBrowserSession(const std::string& sid) const {
    auto result = client_.getEntity("OidcSession", sid);
    if (result.isError()) {
        return Error::notFound("no such session");
    }
    const auto& row = result.value();

    if (row.value("clientId", std::string()) != kBrowserSessionClientId) {
        // Not a browser-level session (e.g. a client-exchange sid replayed
        // here) -- treat identically to "not found", don't leak the distinction.
        return Error::notFound("no such session");
    }
    if (!row.value("revokedAt", nlohmann::json(nullptr)).is_null()) {
        return Error::unauthorized("session revoked");
    }
    long long expiresAt = row.value("expiresAt", 0LL);
    if (expiresAt <= nowUnix()) {
        return Error::unauthorized("session expired");
    }

    BrowserSession session;
    session.userId = row.value("userId", std::string());
    session.tenantId = row.value("tenantId", std::string());
    if (session.userId.empty()) {
        return Error::notFound("no such session");
    }
    return session;
}

Result<bool> OidcService::revokeBrowserSession(const std::string& sid) {
    nlohmann::json update;
    update["revokedAt"] = nowUnix();
    auto result = client_.updateEntity("OidcSession", sid, update);
    if (result.isError()) {
        return result.error();
    }
    return true;
}

Result<std::string> OidcService::buildAuthorizeRedirect(const AuthorizeRequest& req,
                                                          const std::string& userId,
                                                          const std::string& tenantId) {
    auto codeResult = issueCode(req, userId, tenantId);
    if (codeResult.isError()) {
        return codeResult.error();
    }

    std::string separator = req.redirectUri.find('?') == std::string::npos ? "?" : "&";
    std::string location = req.redirectUri + separator + "code=" + codeResult.value();
    if (!req.state.empty()) {
        location += "&state=" + req.state;
    }
    return location;
}

Result<TokenResponse> OidcService::exchangeCode(const std::string& code, const std::string& redirectUri,
                                                 const std::string& clientId,
                                                 const std::string& codeVerifier) {
    auto client = client_config_.get(clientId);
    if (!client) {
        return Error::validationError("invalid_client: unknown client_id");
    }

    auto redeemed = auth_code_store_.redeem(code, clientId);
    if (redeemed.isError()) {
        return redeemed.error();
    }
    const auto& rc = redeemed.value();

    // RFC 6749 §4.1.3 — redirect_uri must match byte-exact even though it
    // was already checked at /authorize; it's bound to the code, not re-derived.
    if (rc.redirectUri != redirectUri) {
        return Error::validationError("invalid_grant: redirect_uri mismatch");
    }

    // PKCE: never allow a downgrade to no-verifier.
    if (codeVerifier.empty()) {
        return Error::validationError("invalid_grant: code_verifier required");
    }
    if (!pkce::verifyS256(codeVerifier, rc.codeChallenge)) {
        return Error::validationError("invalid_grant: PKCE verification failed");
    }

    auto session = createSession(rc.userId, rc.tenantId, rc.clientId);
    if (session.isError()) {
        return session.error();
    }

    tokens::IdTokenClaims idClaims;
    idClaims.subject = rc.userId;
    idClaims.audience = rc.clientId;
    idClaims.sid = session.value();
    idClaims.tenantId = rc.tenantId;
    idClaims.authTime = nowUnix();
    idClaims.nonce = rc.nonce;
    idClaims.ttlSeconds = client->id_token_ttl_seconds;

    auto roleResult = client_.getUserRoleByUsername(rc.userId);

    tokens::AccessTokenClaims accessClaims;
    accessClaims.subject = rc.userId;
    accessClaims.audience = rc.clientId;
    accessClaims.tenantId = rc.tenantId;
    accessClaims.scope = rc.scope;
    accessClaims.role = roleResult.isError() ? "user" : roleResult.value();
    accessClaims.ttlSeconds = client->access_token_ttl_seconds;

    TokenResponse resp;
    try {
        resp.idToken = tokens::issueIdToken(keypair_, issuer_, idClaims);
        resp.accessToken = tokens::issueAccessToken(keypair_, issuer_, accessClaims);
    } catch (const std::exception& e) {
        spdlog::error("[oidc] Token signing failed: {}", e.what());
        return Error::internal("token signing failed");
    }
    resp.expiresIn = client->access_token_ttl_seconds;
    resp.scope = rc.scope;

    // Refresh tokens are only issued when the granted scope actually
    // requested offline access — standard OIDC convention, and consistent
    // with this provider only ever issuing what a client asked for.
    if (scopeContains(rc.scope, "offline_access")) {
        tokens::RefreshTokenRequest rtReq;
        rtReq.clientId = rc.clientId;
        rtReq.userId = rc.userId;
        rtReq.tenantId = rc.tenantId;
        rtReq.scope = rc.scope;
        // familyId left empty: this starts a brand-new rotation chain.
        auto rtResult = refresh_token_store_.issue(rtReq, client->refresh_token_ttl_seconds);
        if (rtResult.hasValue()) {
            resp.refreshToken = rtResult.value();
        } else {
            // Non-fatal: the access+ID tokens issued above are still valid;
            // the client just doesn't get offline access this round.
            spdlog::error("[oidc] Failed to issue refresh token: {}", rtResult.error().what());
        }
    }
    return resp;
}

Result<TokenResponse> OidcService::exchangeRefreshToken(const std::string& refreshToken,
                                                          const std::string& clientId) {
    auto client = client_config_.get(clientId);
    if (!client) {
        return Error::validationError("invalid_client: unknown client_id");
    }

    auto rotated = refresh_token_store_.rotate(refreshToken, clientId);
    if (rotated.isError()) {
        return rotated.error();
    }
    const auto& rt = rotated.value();

    tokens::IdTokenClaims idClaims;
    idClaims.subject = rt.userId;
    idClaims.audience = rt.clientId;
    // No live OidcSession is re-derived for a refresh-token exchange (the
    // RefreshToken row doesn't track sid); sid is informational metadata for
    // the ID token, not something anything else here re-verifies.
    idClaims.sid = "";
    idClaims.tenantId = rt.tenantId;
    idClaims.authTime = nowUnix();
    idClaims.ttlSeconds = client->id_token_ttl_seconds;

    auto roleResult = client_.getUserRoleByUsername(rt.userId);

    tokens::AccessTokenClaims accessClaims;
    accessClaims.subject = rt.userId;
    accessClaims.audience = rt.clientId;
    accessClaims.tenantId = rt.tenantId;
    accessClaims.scope = rt.scope; // never exceeds the original grant's scope
    // Re-looked-up on every refresh (not carried over from the prior token)
    // so a role change takes effect on next refresh without forcing re-login.
    accessClaims.role = roleResult.isError() ? "user" : roleResult.value();
    accessClaims.ttlSeconds = client->access_token_ttl_seconds;

    TokenResponse resp;
    try {
        resp.idToken = tokens::issueIdToken(keypair_, issuer_, idClaims);
        resp.accessToken = tokens::issueAccessToken(keypair_, issuer_, accessClaims);
    } catch (const std::exception& e) {
        spdlog::error("[oidc] Token signing failed: {}", e.what());
        return Error::internal("token signing failed");
    }
    resp.expiresIn = client->access_token_ttl_seconds;
    resp.scope = rt.scope;

    tokens::RefreshTokenRequest nextReq;
    nextReq.clientId = rt.clientId;
    nextReq.userId = rt.userId;
    nextReq.tenantId = rt.tenantId;
    nextReq.scope = rt.scope;
    nextReq.familyId = rt.familyId; // same rotation chain
    nextReq.parentId = rt.tokenId;
    auto nextRefresh = refresh_token_store_.issue(nextReq, client->refresh_token_ttl_seconds);
    if (nextRefresh.hasValue()) {
        resp.refreshToken = nextRefresh.value();
    } else {
        // Non-fatal, same reasoning as exchangeCode: the freshly-issued
        // access+ID tokens above are still good; the client just loses
        // offline access from here since the old refresh token was already
        // consumed (rotated) by refresh_token_store_.rotate() above.
        spdlog::error("[oidc] Failed to issue rotated refresh token: {}", nextRefresh.error().what());
    }
    return resp;
}

Result<bool> OidcService::revokeRefreshToken(const std::string& refreshToken) {
    return refresh_token_store_.revoke(refreshToken);
}

} // namespace dbal::oidc
