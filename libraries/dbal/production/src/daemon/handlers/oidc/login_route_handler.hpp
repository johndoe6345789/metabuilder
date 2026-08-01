/**
 * @file login_route_handler.hpp
 * @brief The interactive (or API-callable) login step that /authorize
 *        redirects to. Not an admin/user-management console — just the
 *        mechanism by which /authorize learns who the user is before
 *        issuing a code, scoped to username+password against the
 *        Credential entity. No self-service registration, no password reset.
 *
 * NOTE: Credential::verify() is real, but until Phase 5 replaces the fake
 * hash algorithm with Argon2id and wires it through the generic adapter
 * (instead of the dead InMemoryStore), this will reject every login. That's
 * expected at this point in the build — Phase 3's own gate tests the
 * code/token/PKCE mechanics directly against a pre-created session rather
 * than through this handler; full end-to-end browser testing happens after
 * Phase 5 lands.
 */
#pragma once

#include "../../../oidc/oidc_service.hpp"
#include "pending_authorize_store.hpp"

#include "dbal/core/client.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::oidc {

class LoginRouteHandler {
public:
    LoginRouteHandler(dbal::Client& client, dbal::oidc::OidcService& service,
                       PendingAuthorizeStore& pendingStore);

    /// GET /oidc/login?continuation=... — renders the login form.
    void handleGet(const drogon::HttpRequestPtr& req,
                    std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// POST /oidc/login — verifies credentials, issues a code, redirects
    /// back to the client's redirect_uri, sets the session cookie.
    void handlePost(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::Client& client_;
    dbal::oidc::OidcService& service_;
    PendingAuthorizeStore& pending_store_;
};

} // namespace dbal::daemon::handlers::oidc
