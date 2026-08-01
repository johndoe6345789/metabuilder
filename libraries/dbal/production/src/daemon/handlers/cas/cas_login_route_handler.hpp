/**
 * @file cas_login_route_handler.hpp
 * @brief The interactive login step /cas/login redirects to when no
 *        ticket-granting session exists — the CAS analog of
 *        oidc::LoginRouteHandler and saml::SamlLoginRouteHandler, sharing
 *        the same Credential-backed verifyCredential() call.
 *
 * Unlike OIDC/SAML, CAS needs no server-side pending-request store: the
 * only thing to carry across the login POST is the `service` URL itself,
 * which travels as a plain hidden form field — it isn't secret (the
 * browser already has it in the query string) and isn't trusted for any
 * authorization decision; the issued ticket's own stored `service` field is
 * what /cas/serviceValidate actually cross-checks.
 */
#pragma once

#include "../../../cas/cas_service.hpp"
#include "dbal/core/client.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::cas {

class CasLoginRouteHandler {
public:
    /// @param publicPathPrefix See oidc::OidcRouteHandler's constructor doc —
    ///        prepended to this form's own action="" URL.
    CasLoginRouteHandler(dbal::Client& client, dbal::cas::CasService& service,
                          std::string publicPathPrefix = "");

    /// GET /cas/login?service=... — renders the login form.
    void handleGet(const drogon::HttpRequestPtr& req,
                    std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// POST /cas/login — verifies credentials, issues a service ticket,
    /// redirects to `service?ticket=...`.
    void handlePost(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::Client& client_;
    dbal::cas::CasService& service_;
    std::string public_path_prefix_;
};

} // namespace dbal::daemon::handlers::cas
