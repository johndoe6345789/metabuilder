/**
 * @file ComposeCtrl.h
 * @brief Send + draft endpoints.
 */

#pragma once

#include <drogon/HttpController.h>

namespace email_backend {

class ComposeCtrl : public drogon::HttpController<ComposeCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ComposeCtrl::send, "/api/compose", drogon::Post);
    ADD_METHOD_TO(ComposeCtrl::listDrafts, "/api/compose/drafts", drogon::Get);
    ADD_METHOD_TO(ComposeCtrl::saveDraft, "/api/compose/drafts", drogon::Post);
    METHOD_LIST_END

    void send(const drogon::HttpRequestPtr& req,
              std::function<void(const drogon::HttpResponsePtr&)>&& cb);
    void listDrafts(const drogon::HttpRequestPtr& req,
                     std::function<void(const drogon::HttpResponsePtr&)>&& cb);
    void saveDraft(const drogon::HttpRequestPtr& req,
                    std::function<void(const drogon::HttpResponsePtr&)>&& cb);
};

} // namespace email_backend
