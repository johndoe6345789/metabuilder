/**
 * @file AccountsCtrl.h
 * @brief Email account CRUD endpoints.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace email_backend {

class AccountsCtrl : public drogon::HttpController<AccountsCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AccountsCtrl::list, "/api/accounts", drogon::Get);
    ADD_METHOD_TO(AccountsCtrl::create, "/api/accounts", drogon::Post);
    ADD_METHOD_TO(AccountsCtrl::get, "/api/accounts/{id}", drogon::Get);
    ADD_METHOD_TO(AccountsCtrl::remove, "/api/accounts/{id}", drogon::Delete);
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void create(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void get(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
             const std::string& id);
    void remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id);
};

} // namespace email_backend
