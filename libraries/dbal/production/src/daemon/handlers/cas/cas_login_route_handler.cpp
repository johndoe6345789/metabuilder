/**
 * @file cas_login_route_handler.cpp
 */
#include "cas_login_route_handler.hpp"
#include "../shared/login_page_style.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::cas {

namespace {

// `service` is SP-supplied and gets embedded into an HTML attribute in the
// login form below — must be escaped to prevent breaking out of the
// attribute (reflected XSS), same reasoning as SAML's RelayState.
std::string htmlAttrEscape(const std::string& in) {
    std::string out;
    out.reserve(in.size());
    for (char c : in) {
        switch (c) {
            case '&': out += "&amp;"; break;
            case '<': out += "&lt;"; break;
            case '>': out += "&gt;"; break;
            case '"': out += "&quot;"; break;
            case '\'': out += "&#39;"; break;
            default: out += c;
        }
    }
    return out;
}

std::string renderLoginForm(const std::string& publicPathPrefix, const std::string& service,
                             const std::string& error = "") {
    std::string errorHtml = error.empty() ? "" : "<div class=\"error\" role=\"alert\">" + error + "</div>";
    return "<!doctype html><html><head><meta charset=\"utf-8\">"
           "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
           "<title>Sign in</title>" + dbal::daemon::handlers::shared::loginPageStyle() +
           "</head><body>"
           "<div class=\"card\">"
           "<p class=\"brand\">MetaBuilder SSO</p>"
           "<h1>Sign in</h1>" + errorHtml +
           "<form method=\"POST\" action=\"" + publicPathPrefix + "/cas/login\">"
           "<input type=\"hidden\" name=\"service\" value=\"" + htmlAttrEscape(service) + "\">"
           "<div class=\"field\"><label for=\"username\">Username</label>"
           "<input id=\"username\" type=\"text\" name=\"username\" autofocus autocomplete=\"username\"></div>"
           "<div class=\"field\"><label for=\"password\">Password</label>"
           "<input id=\"password\" type=\"password\" name=\"password\" autocomplete=\"current-password\"></div>"
           "<button type=\"submit\">Sign in</button>"
           "</form>"
           "<p class=\"footnote\">Signing in via CAS</p>"
           "</div></body></html>";
}

} // namespace

CasLoginRouteHandler::CasLoginRouteHandler(dbal::Client& client, dbal::cas::CasService& service,
                                            std::string publicPathPrefix)
    : client_(client), service_(service), public_path_prefix_(std::move(publicPathPrefix)) {}

void CasLoginRouteHandler::handleGet(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    std::string service = req->getParameter("service");
    if (service.empty()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing service parameter");
        cb(resp);
        return;
    }
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    resp->setBody(renderLoginForm(public_path_prefix_, service));
    cb(resp);
}

void CasLoginRouteHandler::handlePost(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string service = req->getParameter("service");
    std::string username = req->getParameter("username");
    std::string password = req->getParameter("password");

    if (service.empty()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing service parameter");
        cb(resp);
        return;
    }

    auto verifyResult = client_.verifyCredential(username, password);
    if (verifyResult.isError() || !verifyResult.value()) {
        // Deliberately generic message — don't reveal whether the username exists.
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setContentTypeCode(drogon::CT_TEXT_HTML);
        resp->setBody(renderLoginForm(public_path_prefix_, service, "Invalid username or password"));
        cb(resp);
        return;
    }

    // Real tenant, sourced from Credential.tenantId (see the identical fix
    // in oidc/login_route_handler.cpp for the full rationale).
    auto tenantResult = client_.getCredentialTenantId(username);
    const std::string tenantId = tenantResult.isError() ? "system" : tenantResult.value();

    auto ticketResult = service_.issueServiceTicket(username, tenantId, service);
    if (ticketResult.isError()) {
        spdlog::error("[cas] Failed to issue service ticket: {}", ticketResult.error().what());
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k500InternalServerError);
        resp->setBody("Failed to complete sign-in");
        cb(resp);
        return;
    }

    std::string separator = service.find('?') == std::string::npos ? "?" : "&";
    std::string location = service + separator + "ticket=" + ticketResult.value();

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k302Found);
    resp->addHeader("Location", location);
    cb(resp);
}

} // namespace dbal::daemon::handlers::cas
