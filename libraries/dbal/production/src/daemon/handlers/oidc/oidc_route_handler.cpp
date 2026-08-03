/**
 * @file oidc_route_handler.cpp
 */
#include "oidc_route_handler.hpp"
#include "session_cookie.hpp"
#include "../../../security/jwt/rs_jwt_validator.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::oidc {

namespace {

drogon::HttpResponsePtr jsonResponse(const nlohmann::json& body, drogon::HttpStatusCode code = drogon::k200OK) {
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(code);
    resp->setContentTypeCode(drogon::CT_APPLICATION_JSON);
    resp->setBody(body.dump());
    return resp;
}

drogon::HttpResponsePtr oauthError(const std::string& error, const std::string& description,
                                    drogon::HttpStatusCode code = drogon::k400BadRequest) {
    nlohmann::json body;
    body["error"] = error;
    body["error_description"] = description;
    return jsonResponse(body, code);
}

// Errors from OidcService are formatted "error_code: description" — split them
// back apart for OAuth2-shaped JSON error responses.
std::pair<std::string, std::string> splitError(const std::string& message) {
    auto pos = message.find(": ");
    if (pos == std::string::npos) return {"invalid_request", message};
    return {message.substr(0, pos), message.substr(pos + 2)};
}

// RsJwtValidator itself stays Drogon-free (it's linked into the test targets,
// which don't link Drogon) -- the HttpRequest bearer-token extraction lives
// here instead, at its one call site.
std::optional<dbal::security::JwtClaims> validateBearerToken(
    const drogon::HttpRequestPtr& req, const std::string& publicKeyPem, const std::string& issuer) {
    auto auth_header = req->getHeader("Authorization");
    static const std::string bearer_prefix = "Bearer ";
    if (auth_header.size() <= bearer_prefix.size() ||
        auth_header.substr(0, bearer_prefix.size()) != bearer_prefix) {
        return std::nullopt;
    }
    dbal::security::RsJwtValidator validator(publicKeyPem, issuer);
    return validator.validate(auth_header.substr(bearer_prefix.size()));
}

} // namespace

OidcRouteHandler::OidcRouteHandler(dbal::oidc::OidcService& service, PendingAuthorizeStore& pendingStore,
                                    std::string publicPathPrefix)
    : service_(service), pending_store_(pendingStore), public_path_prefix_(std::move(publicPathPrefix)) {}

void OidcRouteHandler::handleDiscovery(
    const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    cb(jsonResponse(service_.discoveryDocument()));
}

void OidcRouteHandler::handleJwks(
    const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    cb(jsonResponse(service_.jwks()));
}

void OidcRouteHandler::handleAuthorize(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string clientId = req->getParameter("client_id");
    std::string redirectUri = req->getParameter("redirect_uri");
    std::string responseType = req->getParameter("response_type");
    std::string scope = req->getParameter("scope");
    std::string state = req->getParameter("state");
    std::string codeChallenge = req->getParameter("code_challenge");
    std::string codeChallengeMethod = req->getParameter("code_challenge_method");
    std::string nonceParam = req->getParameter("nonce");
    std::optional<std::string> nonce = nonceParam.empty() ? std::nullopt : std::optional(nonceParam);

    auto validated = service_.validateAuthorize(clientId, redirectUri, responseType, scope,
                                                 state, codeChallenge, codeChallengeMethod, nonce);
    if (validated.isError()) {
        // client_id/redirect_uri failures never redirect (redirect_uri isn't
        // trusted yet); everything else fails redirect_uri-trusted checks so
        // they COULD redirect with ?error=... — kept as direct JSON errors
        // here too for v1 simplicity, since this is API-first, not yet
        // fronted by a browser-facing SPA that would need the redirect.
        auto [err, desc] = splitError(validated.error().what());
        spdlog::info("[oidc] /authorize rejected: {} ({})", err, desc);
        cb(oauthError(err, desc));
        return;
    }
    const auto& authReq = validated.value();

    auto sidCookie = req->getCookie(kSessionCookieName);
    if (!sidCookie.empty()) {
        auto sessionResult = service_.lookupBrowserSession(sidCookie);
        if (sessionResult.hasValue()) {
            // Existing SSO session from a prior login (possibly at a
            // different client) -- skip the login form entirely and issue a
            // code straight away. This is what makes it actually "single"
            // sign-on rather than just a shared login page: no consent
            // screen either, which is fine for first-party apps but would
            // need one for third-party clients.
            const auto& session = sessionResult.value();
            auto locationResult = service_.buildAuthorizeRedirect(authReq, session.userId, session.tenantId);
            if (locationResult.hasValue()) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k302Found);
                resp->addHeader("Location", locationResult.value());
                cb(resp);
                return;
            }
            spdlog::error("[oidc] Session-reuse code issuance failed: {}", locationResult.error().what());
            // Fall through to the login form rather than hard-failing --
            // the user can still complete a fresh login.
        }
        // Missing/revoked/expired/lookup-error: fall through to login, same
        // as having no cookie at all.
    }

    std::string continuationToken = pending_store_.store(authReq);
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k302Found);
    resp->addHeader("Location", public_path_prefix_ + "/oidc/login?continuation=" + continuationToken);
    cb(resp);
}

void OidcRouteHandler::handleToken(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string grantType = req->getParameter("grant_type");

    Result<dbal::oidc::TokenResponse> result = Error::validationError("unreachable");
    std::string clientId;

    if (grantType == "authorization_code") {
        std::string code = req->getParameter("code");
        std::string redirectUri = req->getParameter("redirect_uri");
        clientId = req->getParameter("client_id");
        std::string codeVerifier = req->getParameter("code_verifier");

        if (code.empty() || redirectUri.empty() || clientId.empty()) {
            cb(oauthError("invalid_request", "code, redirect_uri, and client_id are required"));
            return;
        }
        result = service_.exchangeCode(code, redirectUri, clientId, codeVerifier);
    } else if (grantType == "refresh_token") {
        std::string refreshToken = req->getParameter("refresh_token");
        clientId = req->getParameter("client_id");

        if (refreshToken.empty() || clientId.empty()) {
            cb(oauthError("invalid_request", "refresh_token and client_id are required"));
            return;
        }
        result = service_.exchangeRefreshToken(refreshToken, clientId);
    } else {
        cb(oauthError("unsupported_grant_type",
                       "only authorization_code and refresh_token are supported"));
        return;
    }

    if (result.isError()) {
        auto [err, desc] = splitError(result.error().what());
        spdlog::info("[oidc] /token rejected for client {}: {} ({})", clientId, err, desc);
        cb(oauthError(err, desc));
        return;
    }

    const auto& tok = result.value();
    nlohmann::json body;
    body["access_token"] = tok.accessToken;
    body["id_token"] = tok.idToken;
    body["token_type"] = tok.tokenType;
    body["expires_in"] = tok.expiresIn;
    body["scope"] = tok.scope;
    if (!tok.refreshToken.empty()) {
        body["refresh_token"] = tok.refreshToken;
    }

    auto resp = jsonResponse(body);
    resp->addHeader("Cache-Control", "no-store");
    resp->addHeader("Pragma", "no-cache");
    cb(resp);
}

void OidcRouteHandler::handleUserinfo(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    auto claims = validateBearerToken(
        req, service_.keypair().publicKeyPem(), service_.issuer());
    if (!claims) {
        auto resp = jsonResponse({{"error", "invalid_token"}}, drogon::k401Unauthorized);
        resp->addHeader("WWW-Authenticate", "Bearer error=\"invalid_token\"");
        cb(resp);
        return;
    }

    nlohmann::json body;
    body["sub"] = claims->user_id;
    body["tenant_id"] = claims->tenant_id;
    body["role"] = claims->role;
    cb(jsonResponse(body));
}

void OidcRouteHandler::handleLogout(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    std::string sidCookie = req->getCookie(kSessionCookieName);
    if (!sidCookie.empty()) {
        auto revokeResult = service_.revokeBrowserSession(sidCookie);
        if (revokeResult.isError()) {
            spdlog::warn("[oidc] Failed to revoke browser session on logout: {}",
                         revokeResult.error().what());
            // Non-fatal -- still clear the cookie and proceed. Worst case the
            // row lingers until its own expiresAt ceiling.
        }
    }

    // Optional refresh-token revocation. GET (direct browser navigation to
    // end_session_endpoint) has no body; only POST (the JS package's fetch
    // call) can supply one.
    std::string refreshToken;
    std::string postLogoutRedirectUri;
    std::string state;
    std::string clientId;
    if (req->method() == drogon::HttpMethod::Post) {
        refreshToken = req->getParameter("refresh_token");
        postLogoutRedirectUri = req->getParameter("post_logout_redirect_uri");
        state = req->getParameter("state");
        clientId = req->getParameter("client_id");
    } else {
        postLogoutRedirectUri = req->getParameter("post_logout_redirect_uri");
        state = req->getParameter("state");
        clientId = req->getParameter("client_id");
    }
    if (!refreshToken.empty()) {
        auto revokeResult = service_.revokeRefreshToken(refreshToken);
        if (revokeResult.isError()) {
            spdlog::warn("[oidc] Failed to revoke refresh token on logout: {}",
                         revokeResult.error().what());
        }
    }

    drogon::HttpResponsePtr resp;
    bool redirected = false;
    if (!postLogoutRedirectUri.empty() && !clientId.empty()) {
        auto client = service_.clientConfig().get(clientId);
        if (client && client->isValidPostLogoutRedirectUri(postLogoutRedirectUri)) {
            std::string separator = postLogoutRedirectUri.find('?') == std::string::npos ? "?" : "&";
            std::string location = postLogoutRedirectUri;
            if (!state.empty()) {
                location += separator + "state=" + state;
            }
            resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(drogon::k302Found);
            resp->addHeader("Location", location);
            redirected = true;
        } else {
            spdlog::info("[oidc] Ignoring unregistered post_logout_redirect_uri for client {}", clientId);
        }
    }
    if (!redirected) {
        resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(req->method() == drogon::HttpMethod::Post ? drogon::k204NoContent : drogon::k200OK);
        if (req->method() != drogon::HttpMethod::Post) {
            resp->setContentTypeCode(drogon::CT_TEXT_HTML);
            resp->setBody("<!doctype html><html><body><p>You have been signed out.</p></body></html>");
        }
    }

    clearSessionCookie(resp, public_path_prefix_, service_.issuer());
    cb(resp);
}

} // namespace dbal::daemon::handlers::oidc
