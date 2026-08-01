/**
 * @file saml_login_route_handler.hpp
 * @brief The interactive login step /saml/sso redirects to — the SAML
 *        analog of oidc::LoginRouteHandler, sharing the same
 *        Credential-backed verifyCredential() call, just issuing a signed
 *        SAML Response (auto-submit POST-binding form) instead of an
 *        authorization code.
 */
#pragma once

#include "../../../saml/saml_service.hpp"
#include "dbal/core/client.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::saml {

class SamlLoginRouteHandler {
public:
    /// @param publicPathPrefix See oidc::OidcRouteHandler's constructor doc —
    ///        prepended to this form's own action="" URL.
    SamlLoginRouteHandler(dbal::Client& client, dbal::saml::SamlService& service,
                           std::string publicPathPrefix = "");

    /// GET /saml/login?continuation=<requestId> — renders the login form.
    void handleGet(const drogon::HttpRequestPtr& req,
                    std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// POST /saml/login — verifies credentials, issues a signed Response,
    /// renders an auto-submitting HTML form (POST binding) to the SP's ACS URL.
    void handlePost(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::Client& client_;
    dbal::saml::SamlService& service_;
    std::string public_path_prefix_;
};

} // namespace dbal::daemon::handlers::saml
