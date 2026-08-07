/**
 * @file AdminCtrl.h
 * @brief Per-user data-wipe endpoint.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class AdminCtrl : public drogon::HttpController<AdminCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AdminCtrl::wipe, "/api/wipe", drogon::Post);
    METHOD_LIST_END

    void wipe(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
