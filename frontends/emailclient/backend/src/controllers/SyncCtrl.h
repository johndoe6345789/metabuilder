/**
 * @file SyncCtrl.h
 * @brief IMAP sync trigger + status endpoints.
 */

#pragma once

#include <drogon/HttpController.h>

namespace email_backend {

class SyncCtrl : public drogon::HttpController<SyncCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SyncCtrl::trigger, "/api/sync/{accountId}", drogon::Post);
    ADD_METHOD_TO(SyncCtrl::status, "/api/sync/{accountId}/status", drogon::Get);
    METHOD_LIST_END

    void trigger(const drogon::HttpRequestPtr& req,
                 std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                 const std::string& accountId);
    void status(const drogon::HttpRequestPtr& req,
                std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                const std::string& accountId);
};

} // namespace email_backend
