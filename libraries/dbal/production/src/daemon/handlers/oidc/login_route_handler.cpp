/**
 * @file login_route_handler.cpp
 */
#include "login_route_handler.hpp"
#include "../shared/login_page_style.hpp"
#include "session_cookie.hpp"

#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::oidc {

namespace {

// Reads a `{"user":"...","pass":"..."}` blob from the clipboard (copied
// from vault.wardcrew.com), fills the form, and submits it -- the single
// central implementation of "Turbologin" now that every app's own login
// page redirects here instead of collecting a password itself.
constexpr const char* kTurboLoginScript = R"JS(
<script>
async function turboLogin() {
  const errEl = document.getElementById('turbo-error');
  errEl.style.display = 'none';
  try {
    const raw = await navigator.clipboard.readText();
    if (!raw.trim()) throw new Error('Clipboard is empty. Copy a Turbologin from vault.wardcrew.com first.');
    let data;
    try { data = JSON.parse(raw); } catch { throw new Error('Clipboard does not contain valid Turbologin JSON.'); }
    if (!data.user || !data.pass) throw new Error('Clipboard JSON is missing required fields (user, pass).');
    document.getElementById('username').value = data.user;
    document.getElementById('password').value = data.pass;
    document.getElementById('login-form').submit();
  } catch (e) {
    errEl.textContent = e.message || 'Could not read clipboard. Please allow clipboard access and try again.';
    errEl.style.display = 'block';
  }
}
</script>
)JS";

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
           "<form id=\"login-form\" method=\"POST\" action=\"" + publicPathPrefix + "/oidc/login\">"
           "<input type=\"hidden\" name=\"continuation\" value=\"" + continuationToken + "\">"
           "<div class=\"field\"><label for=\"username\">Username</label>"
           "<input id=\"username\" type=\"text\" name=\"username\" autofocus autocomplete=\"username\"></div>"
           "<div class=\"field\"><label for=\"password\">Password</label>"
           "<input id=\"password\" type=\"password\" name=\"password\" autocomplete=\"current-password\"></div>"
           "<button type=\"submit\">Sign in</button>"
           "</form>"
           "<div class=\"divider\">or</div>"
           "<div class=\"error\" id=\"turbo-error\" role=\"alert\" style=\"display:none\"></div>"
           "<button type=\"button\" class=\"turbo\" onclick=\"turboLogin()\">\xE2\x9A\xA1 Turbologin</button>" +
           kTurboLoginScript +
           "<p class=\"footnote\">Signing in via OpenID Connect</p>"
           "</div></body></html>";
}
} // namespace

LoginRouteHandler::LoginRouteHandler(dbal::Client& client, dbal::oidc::OidcService& service,
                                      PendingAuthorizeStore& pendingStore, std::string publicPathPrefix)
    : client_(client), service_(service), pending_store_(pendingStore),
      public_path_prefix_(std::move(publicPathPrefix)) {}

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
    resp->setBody(renderLoginForm(public_path_prefix_, continuation));
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
        resp->setBody(renderLoginForm(public_path_prefix_, retryToken, "Invalid username or password"));
        cb(resp);
        return;
    }

    // Username-as-subject: simple for a credential-only login where there's
    // no separate profile/User linkage required for the "sub" claim.
    const std::string& userId = username;
    // Real tenant, sourced from Credential.tenantId (falls back to "system"
    // for un-migrated rows) -- this is what the multi-tenant JWT-claim
    // cross-check (server_routes.cpp) authorizes against, so it must reflect
    // the actual user, not a fixed default.
    auto tenantResult = client_.getCredentialTenantId(username);
    const std::string tenantId = tenantResult.isError() ? "system" : tenantResult.value();

    auto locationResult = service_.buildAuthorizeRedirect(*pending, userId, tenantId);
    if (locationResult.isError()) {
        spdlog::error("[oidc] Failed to issue authorization code: {}", locationResult.error().what());
        auto resp = drogon::HttpResponse::newHttpResponse();
        resp->setStatusCode(drogon::k500InternalServerError);
        resp->setBody("Failed to complete sign-in");
        cb(resp);
        return;
    }

    auto resp = drogon::HttpResponse::newHttpResponse();
    resp->setStatusCode(drogon::k302Found);
    resp->addHeader("Location", locationResult.value());

    // Browser-level SSO session so a subsequent /authorize call from a
    // *different* client can skip this login form entirely (see
    // OidcRouteHandler::handleAuthorize). Non-fatal if it fails to create --
    // the current login still succeeds, just without carrying over to other
    // apps this round.
    auto sessionResult = service_.createBrowserSession(userId, tenantId);
    if (sessionResult.hasValue()) {
        setSessionCookie(resp, sessionResult.value(), public_path_prefix_, service_.issuer());
    } else {
        spdlog::warn("[oidc] Failed to create browser session: {}", sessionResult.error().what());
    }

    cb(resp);
}

} // namespace dbal::daemon::handlers::oidc
