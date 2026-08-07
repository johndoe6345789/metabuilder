/**
 * @file ProfileCtrl.h
 * @brief User profile read/update endpoints, proxied to DBAL.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class ProfileCtrl : public drogon::HttpController<ProfileCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ProfileCtrl::get, "/api/profile", drogon::Get);
    ADD_METHOD_TO(ProfileCtrl::update, "/api/profile", drogon::Put);
    METHOD_LIST_END

    void get(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void update(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
