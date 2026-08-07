/**
 * @file AuthCtrl.h
 * @brief Authenticated-identity + per-user settings endpoints.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class AuthCtrl : public drogon::HttpController<AuthCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AuthCtrl::me, "/api/auth/me", drogon::Get);
    ADD_METHOD_TO(AuthCtrl::getSettings, "/api/auth/settings", drogon::Get);
    ADD_METHOD_TO(AuthCtrl::putSettings, "/api/auth/settings", drogon::Put);
    METHOD_LIST_END

    void me(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void getSettings(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void putSettings(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
