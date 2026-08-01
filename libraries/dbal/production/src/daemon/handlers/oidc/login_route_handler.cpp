/**
 * @file login_route_handler.cpp
 */
#include "login_route_handler.hpp"
#include "../shared/login_page_style.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::oidc {

namespace {
constexpr const char* kSessionCookieName = "dbal_oidc_sid";

std::string renderLoginForm(const std::string& continuationToken, const std::string& error = "") {
    std::string errorHtml = error.empty() ? "" : "<div class=\"error\" role=\"alert\">" + error + "</div>";
    return "<!doctype html><html><head><meta charset=\"utf-8\">"
           "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
           "<title>Sign in</title>" + dbal::daemon::handlers::shared::loginPageStyle() +
           "</head><body>"
           "<div class=\"card\">"
           "<p class=\"brand\">MetaBuilder SSO</p>"
           "<h1>Sign in</h1>" + errorHtml +
           "<form method=\"POST\" action=\"/oidc/login\">"
           "<input type=\"hidden\" name=\"continuation\" value=\"" + continuationToken + "\">"
           "<div class=\"field\"><label for=\"username\">Username</label>"
           "<input id=\"username\" type=\"text\" name=\"username\" autofocus autocomplete=\"username\"></div>"
           "<div class=\"field\"><label for=\"password\">Password</label>"
           "<input id=\"password\" type=\"password\" name=\"password\" autocomplete=\"current-password\"></div>"
           "<button type=\"submit\">Sign in</button>"
           "</form>"
           "<p class=\"footnote\">Signing in via OpenID Connect</p>"
           "</div></body></html>";
}
} // namespace

LoginRouteHandler::LoginRouteHandler(dbal::Client& client, dbal::oidc::OidcService& service,
                                      PendingAuthorizeStore& pendingStore)
    : client_(client), service_(service), pending_store_(pendingStore) {}

void LoginRouteHandler::handleGet(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) const {
    std::string continuation = req->getParameter("continuation");
    if (continuation.empty()) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Missing continuation token — start over at /oidc/authorize");
        cb(resp);
        return;
    }
    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setContentTypeCode(drogon::CT_TEXT_HTML);
    resp->setBody(renderLoginForm(continuation));
    cb(resp);
}

void LoginRouteHandler::handlePost(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {

    std::string continuation = req->getParameter("continuation");
    std::string username = req->getParameter("username");
    std::string password = req->getParameter("password");

    auto pending = pending_store_.take(continuation);
    if (!pending) {
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k400BadRequest);
        resp->setBody("Login session expired — start over at /oidc/authorize");
        cb(resp);
        return;
    }

    auto verifyResult = client_.verifyCredential(username, password);
    if (verifyResult.isError() || !verifyResult.value()) {
        // Deliberately generic message — don't reveal whether the username exists.
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setContentTypeCode(drogon::CT_TEXT_HTML);
        // Re-issue a fresh continuation token for the retry (the old one was consumed).
        std::string retryToken = pending_store_.store(*pending);
        resp->setBody(renderLoginForm(retryToken, "Invalid username or password"));
        cb(resp);
        return;
    }

    // Username-as-subject: simple for a credential-only login where there's
    // no separate profile/User linkage required for the "sub" claim.
    const std::string& userId = username;
    // tenantId resolution: single-tenant "system" default for v1 — the
    // multi-tenant JWT-claim cross-check (server_routes.cpp) is what
    // actually matters for authorization; login itself doesn't need to pick
    // a tenant beyond what the client is scoped to.
    const std::string tenantId = "system";

    auto codeResult = service_.issueCode(*pending, userId, tenantId);
    if (codeResult.isError()) {
        spdlog::error("[oidc] Failed to issue authorization code: {}", codeResult.error().what());
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k500InternalServerError);
        resp->setBody("Failed to complete sign-in");
        cb(resp);
        return;
    }

    std::string separator = pending->redirectUri.find('?') == std::string::npos ? "?" : "&";
    std::string location = pending->redirectUri + separator + "code=" + codeResult.value();
    if (!pending->state.empty()) {
        location += "&state=" + pending->state;
    }

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k302Found);
    resp->addHeader("Location", location);
    cb(resp);
}

} // namespace dbal::daemon::handlers::oidc
