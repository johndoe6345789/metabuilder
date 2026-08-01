/**
 * @file saml_route_handler.cpp
 */
#include "saml_route_handler.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::saml {

SamlRouteHandler::SamlRouteHandler(dbal::saml::SamlService& service, std::string publicPathPrefix)
    : service_(service), public_path_prefix_(std::move(publicPathPrefix)) {}

void SamlRouteHandler::handleMetadata(
    const drogon::HttpRequestPtr&, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCodeAndCustomString(drogon::CT_CUSTOM, "application/samlmetadata+xml; charset=utf-8");
    resp->setBody(service_.metadataDocument());
    cb(resp);
}

void SamlRouteHandler::handleSso(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string samlRequest = req->getParameter("SAMLRequest");
    std::string relayStateParam = req->getParameter("RelayState");
    std::optional<std::string> relayState = relayStateParam.empty() ? std::nullopt : std::optional(relayStateParam);

    if (samlRequest.empty()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing SAMLRequest parameter");
        cb(resp);
        return;
    }

    auto result = service_.handleSsoRequest(samlRequest, relayState);
    if (result.isError()) {
        spdlog::info("[saml] /sso rejected: {}", result.error().what());
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody(result.error().what());
        cb(resp);
        return;
    }

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k302Found);
    resp->addHeader("Location", public_path_prefix_ + "/saml/login?continuation=" + result.value());
    cb(resp);
}

} // namespace dbal::daemon::handlers::saml
