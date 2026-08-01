/**
 * @file login_route_handler.hpp
 * @brief The interactive (or API-callable) login step that /authorize
 *        redirects to. Not an admin/user-management console — just the
 *        mechanism by which /authorize learns who the user is before
 *        issuing a code, scoped to username+password against the
 *        Credential entity. No self-service registration, no password reset.
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
    /// @param publicPathPrefix See OidcRouteHandler's constructor doc — same
    ///        reverse-proxy-prefix concern applies to this form's own
    ///        action="" URL.
    LoginRouteHandler(dbal::Client& client, dbal::oidc::OidcService& service,
                       PendingAuthorizeStore& pendingStore, std::string publicPathPrefix = "");

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
    std::string public_path_prefix_;
};

} // namespace dbal::daemon::handlers::oidc
