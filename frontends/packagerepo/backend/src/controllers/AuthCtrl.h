/**
 * @file AuthCtrl.h
 * @brief Authentication endpoints: me, change-password.
 *
 * Sign-in itself goes through DBAL SSO (browser OIDC redirect) on the
 * frontend now -- this controller only serves the already-authenticated
 * paths, plus password management for the separate Basic-auth account
 * store used by Docker CLI clients (see PgUserStore, RegistryAuth).
 */

#pragma once

#include <drogon/HttpController.h>

namespace repo
{

class AuthCtrl : public drogon::HttpController<AuthCtrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthCtrl::me, "/auth/me", drogon::Get, "repo::AuthFilter");
    ADD_METHOD_TO(AuthCtrl::changePassword, "/auth/change-password",
                  drogon::Post, "repo::AuthFilter");
    METHOD_LIST_END

    /// @brief Get current user info from token.
    void me(const drogon::HttpRequestPtr& req,
            std::function<void(const drogon::HttpResponsePtr&)>&& cb);

    /// @brief Change authenticated user's password.
    void
    changePassword(const drogon::HttpRequestPtr& req,
                   std::function<void(const drogon::HttpResponsePtr&)>&& cb);
};

} // namespace repo
