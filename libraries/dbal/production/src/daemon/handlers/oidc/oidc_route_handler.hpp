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
    OidcRouteHandler(dbal::oidc::OidcService& service, PendingAuthorizeStore& pendingStore);

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

private:
    dbal::oidc::OidcService& service_;
    PendingAuthorizeStore& pending_store_;
};

} // namespace dbal::daemon::handlers::oidc
