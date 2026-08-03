/**
 * @file session_cookie.hpp
 * @brief The browser-level SSO session cookie shared by the login, authorize,
 *        and logout OIDC handlers. Consolidates what used to be an
 *        independently-duplicated kSessionCookieName constant in two files.
 */
#pragma once

#include <drogon/HttpResponse.h>
#include <string>

namespace dbal::daemon::handlers::oidc {

constexpr const char* kSessionCookieName = "dbal_oidc_sid";

/**
 * @brief Sets the dbal_oidc_sid cookie after a successful login.
 * @param publicPathPrefix Same reverse-proxy prefix threaded through the
 *        handlers for building Location headers -- the cookie Path must
 *        match what the *browser* sees, not DBAL's internal route path.
 * @param issuer Used only to decide Secure (true for an https:// issuer).
 */
void setSessionCookie(const drogon::HttpResponsePtr& resp, const std::string& sid,
                       const std::string& publicPathPrefix, const std::string& issuer);

/// Clears the session cookie (used by /oidc/logout). Same Path/Secure
/// derivation as setSessionCookie so the browser actually matches and drops it.
void clearSessionCookie(const drogon::HttpResponsePtr& resp, const std::string& publicPathPrefix,
                         const std::string& issuer);

} // namespace dbal::daemon::handlers::oidc
