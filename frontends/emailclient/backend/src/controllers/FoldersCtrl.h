/**
 * @file FoldersCtrl.h
 * @brief IMAP folder listing endpoint.
 */

#pragma once

#include <drogon/HttpController.h>

namespace email_backend {

class FoldersCtrl : public drogon::HttpController<FoldersCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FoldersCtrl::list, "/api/folders/{accountId}", drogon::Get);
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr& req,
              std::function<void(const drogon::HttpResponsePtr&)>&& cb,
              const std::string& accountId);
};

} // namespace email_backend
