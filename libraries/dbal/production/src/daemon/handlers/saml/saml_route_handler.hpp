/**
 * @file saml_route_handler.hpp
 * @brief HTTP-shape layer for /saml/metadata and /saml/sso. All actual
 *        validation/security logic lives in SamlService — this class only
 *        translates HTTP requests into calls on it and results back into
 *        HTTP responses.
 */
#pragma once

#include "../../../saml/saml_service.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::saml {

class SamlRouteHandler {
public:
    /// @param publicPathPrefix See oidc::OidcRouteHandler's constructor doc —
    ///        prepended to the /saml/login redirect this handler issues.
    explicit SamlRouteHandler(dbal::saml::SamlService& service, std::string publicPathPrefix = "");

    void handleMetadata(const drogon::HttpRequestPtr& req,
                         std::function<void(const drogon::HttpResponsePtr&)>&& cb) const;

    /// GET /saml/sso?SAMLRequest=...&RelayState=... (HTTP-Redirect binding) —
    /// validates the request, then redirects to /saml/login.
    void handleSso(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::saml::SamlService& service_;
    std::string public_path_prefix_;
};

} // namespace dbal::daemon::handlers::saml
