/**
 * @file saml_login_route_handler.cpp
 */
#include "saml_login_route_handler.hpp"
#include "../shared/login_page_style.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::saml {

namespace {

// RelayState is SP-supplied (attacker-influenced) and gets embedded into an
// HTML attribute in the auto-submit form below — must be escaped to prevent
// breaking out of the attribute (reflected XSS).
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

std::string renderLoginForm(const std::string& publicPathPrefix, const std::string& continuationToken,
                             const std::string& error = "") {
    std::string errorHtml = error.empty() ? "" : "<div class=\"error\" role=\"alert\">" + error + "</div>";
    return "<!doctype html><html><head><meta charset=\"utf-8\">"
           "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
           "<title>Sign in</title>" + dbal::daemon::handlers::shared::loginPageStyle() +
           "</head><body>"
           "<div class=\"card\">"
           "<p class=\"brand\">MetaBuilder SSO</p>"
           "<h1>Sign in</h1>" + errorHtml +
           "<form method=\"POST\" action=\"" + publicPathPrefix + "/saml/login\">"
           "<input type=\"hidden\" name=\"continuation\" value=\"" +
           htmlAttrEscape(continuationToken) + "\">"
           "<div class=\"field\"><label for=\"username\">Username</label>"
           "<input id=\"username\" type=\"text\" name=\"username\" autofocus autocomplete=\"username\"></div>"
           "<div class=\"field\"><label for=\"password\">Password</label>"
           "<input id=\"password\" type=\"password\" name=\"password\" autocomplete=\"current-password\"></div>"
           "<button type=\"submit\">Sign in</button>"
           "</form>"
           "<p class=\"footnote\">Signing in via SAML 2.0</p>"
           "</div></body></html>";
}

// SAML HTTP-POST binding: an auto-submitting form, per the bindings spec.
std::string renderAutoSubmitForm(const std::string& acsUrl, const std::string& samlResponseB64,
                                  const std::optional<std::string>& relayState) {
    std::string relayField = relayState
        ? "<input type=\"hidden\" name=\"RelayState\" value=\"" + htmlAttrEscape(*relayState) + "\">"
        : "";
    return "<!doctype html><html><head><meta charset=\"utf-8\">"
           "<title>Redirecting…</title>" + dbal::daemon::handlers::shared::loginPageStyle() +
           "</head><body onload=\"document.forms[0].submit()\">"
           "<div class=\"card\">"
           "<p class=\"brand\">MetaBuilder SSO</p>"
           "<h1>Redirecting…</h1>"
           "<p class=\"footnote\">Completing sign-in, please wait.</p>"
           "<form method=\"POST\" action=\"" + htmlAttrEscape(acsUrl) + "\">"
           "<input type=\"hidden\" name=\"SAMLResponse\" value=\"" + htmlAttrEscape(samlResponseB64) + "\">" +
           relayField +
           "<noscript><button type=\"submit\">Continue</button></noscript>"
           "</form>"
           "</div></body></html>";
}

} // namespace

SamlLoginRouteHandler::SamlLoginRouteHandler(dbal::Client& client, dbal::saml::SamlService& service,
                                              std::string publicPathPrefix)
    : client_(client), service_(service), public_path_prefix_(std::move(publicPathPrefix)) {}

void SamlLoginRouteHandler::handleGet(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    std::string continuation = req->getParameter("continuation");
    if (continuation.empty()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing continuation token — start over at /saml/sso");
        cb(resp);
        return;
    }
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    resp->setBody(renderLoginForm(public_path_prefix_, continuation));
    cb(resp);
}

void SamlLoginRouteHandler::handlePost(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string continuation = req->getParameter("continuation");
    std::string username = req->getParameter("username");
    std::string password = req->getParameter("password");

    auto verifyResult = client_.verifyCredential(username, password);
    if (verifyResult.isError() || !verifyResult.value()) {
        // Deliberately generic message — don't reveal whether the username exists.
        // Note: unlike OIDC, the continuation token here (the AuthnRequest's own
        // requestId) is NOT re-issued on failure — it's still unconsumed in
        // SamlRequestStore (only issueResponse() consumes it), so retrying with
        // the same token works until it naturally expires.
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setContentTypeCode(drogon::CT_TEXT_HTML);
        resp->setBody(renderLoginForm(public_path_prefix_, continuation, "Invalid username or password"));
        cb(resp);
        return;
    }

    auto issued = service_.issueResponse(continuation, username);
    if (issued.isError()) {
        spdlog::info("[saml] Failed to issue Response: {}", issued.error().what());
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody(issued.error().what());
        cb(resp);
        return;
    }

    const auto& r = issued.value();
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    resp->setBody(renderAutoSubmitForm(r.acsUrl, r.samlResponseBase64, r.relayState));
    cb(resp);
}

} // namespace dbal::daemon::handlers::saml
