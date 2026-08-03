/**
 * @file session_cookie.cpp
 */
#include "session_cookie.hpp"

namespace dbal::daemon::handlers::oidc {

namespace {
// Matches the absolute ceiling already used for OidcSession.expiresAt
// (see OidcService::createSession) -- no point outliving the row it names.
constexpr int kMaxAgeSeconds = 12 * 3600;

bool issuerIsHttps(const std::string& issuer) {
    return issuer.rfind("https://", 0) == 0;
}
} // namespace

void setSessionCookie(const drogon::HttpResponsePtr& resp, const std::string& sid,
                       const std::string& publicPathPrefix, const std::string& issuer) {
    drogon::Cookie cookie(kSessionCookieName, sid);
    cookie.setPath(publicPathPrefix + "/oidc");
    cookie.setHttpOnly(true);
    cookie.setSecure(issuerIsHttps(issuer));
    cookie.setSameSite(drogon::Cookie::SameSite::kLax);
    cookie.setMaxAge(kMaxAgeSeconds);
    resp->addCookie(cookie);
}

void clearSessionCookie(const drogon::HttpResponsePtr& resp, const std::string& publicPathPrefix,
                         const std::string& issuer) {
    drogon::Cookie cookie(kSessionCookieName, "");
    cookie.setPath(publicPathPrefix + "/oidc");
    cookie.setHttpOnly(true);
    cookie.setSecure(issuerIsHttps(issuer));
    cookie.setSameSite(drogon::Cookie::SameSite::kLax);
    cookie.setMaxAge(0);
    resp->addCookie(cookie);
}

} // namespace dbal::daemon::handlers::oidc
