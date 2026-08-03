/**
 * @file oidc_route_handler.hpp
 * @brief HTTP-shape layer for discovery, JWKS, /authorize, and /token.
 *        All actual validation/security logic lives in OidcService — this
 *        class only translates HTTP requests into calls on it and results
 *        back into HTTP responses (query params, redirects, status codes).
 */
#pragma once

#include "../../../oidc/oidc_service.hpp"
#include "pending_authorize_store.hpp"

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::oidc {

class OidcRouteHandler {
public:
    /**
     * @param publicPathPrefix Prepended to Location headers this handler
     *        generates for browser-facing redirects (e.g. "/api/dbal" when
     *        fronted by a reverse proxy that strips that prefix before
     *        forwarding — DBAL itself always registers routes at their bare
     *        paths, so without this its own redirects would send the
     *        browser to a path the proxy never routes back to DBAL).
     *        Empty string (default) for an unproxied deployment.
     */
    OidcRouteHandler(dbal::oidc::OidcService& service, PendingAuthorizeStore& pendingStore,
                      std::string publicPathPrefix = "");

    void handleDiscovery(const drogon::HttpRequestPtr& req,
                          std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    void handleJwks(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// GET /oidc/authorize — validates the request, then either redirects to
    /// /oidc/login (no session cookie) or issues a code immediately (valid
    /// session cookie already present).
    void handleAuthorize(const drogon::HttpRequestPtr& req,
                          std::function<void(const drogon::HttpResponsePtr&)>&& cb);

    /// POST /oidc/token — authorization_code and refresh_token grants.
    void handleToken(const drogon::HttpRequestPtr& req,
                      std::function<void(const drogon::HttpResponsePtr&)>&& cb);

    /// GET /oidc/userinfo — bearer-token-verified, returns {sub, tenant_id, role}.
    void handleUserinfo(const drogon::HttpRequestPtr& req,
                         std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// POST/GET /oidc/logout (end_session_endpoint) — revokes the browser
    /// session so /authorize can't resurrect it, clears the cookie,
    /// optionally revokes a supplied refresh token, and honors
    /// post_logout_redirect_uri if supplied and registered for the client.
    void handleLogout(const drogon::HttpRequestPtr& req,
                       std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::oidc::OidcService& service_;
    PendingAuthorizeStore& pending_store_;
    std::string public_path_prefix_;
};

} // namespace dbal::daemon::handlers::oidc
