/**
 * @file oidc_route_handler.cpp
 */
#include "oidc_route_handler.hpp"

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

constexpr const char* kSessionCookieName = "dbal_oidc_sid";

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
        // TODO(Phase 5): once real login exists, look up the OidcSession by
        // this sid, confirm it's unrevoked/unexpired and belongs to a real
        // user, and issue the code immediately instead of redirecting to
        // /oidc/login. Left as a stub for now — always re-prompt for login.
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

} // namespace dbal::daemon::handlers::oidc
