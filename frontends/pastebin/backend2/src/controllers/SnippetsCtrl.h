/**
 * @file SnippetsCtrl.h
 * @brief Snippet CRUD, sharing, revisions, fork, and bulk-move endpoints.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class SnippetsCtrl : public drogon::HttpController<SnippetsCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(SnippetsCtrl::list, "/api/snippets", drogon::Get);
    ADD_METHOD_TO(SnippetsCtrl::get, "/api/snippets/{id}", drogon::Get);
    ADD_METHOD_TO(SnippetsCtrl::create, "/api/snippets", drogon::Post);
    ADD_METHOD_TO(SnippetsCtrl::update, "/api/snippets/{id}", drogon::Put);
    ADD_METHOD_TO(SnippetsCtrl::remove, "/api/snippets/{id}", drogon::Delete);
    ADD_METHOD_TO(SnippetsCtrl::share, "/api/snippets/{id}/share",
                  drogon::Post);
    ADD_METHOD_TO(SnippetsCtrl::unshare, "/api/snippets/{id}/share",
                  drogon::Delete);
    ADD_METHOD_TO(SnippetsCtrl::getShared, "/api/share/{token}", drogon::Get);
    ADD_METHOD_TO(SnippetsCtrl::forkShared, "/api/share/{token}/fork",
                  drogon::Post);
    ADD_METHOD_TO(SnippetsCtrl::revisions, "/api/snippets/{id}/revisions",
                  drogon::Get);
    ADD_METHOD_TO(SnippetsCtrl::revert,
                  "/api/snippets/{id}/revisions/{revId}/revert",
                  drogon::Post);
    ADD_METHOD_TO(SnippetsCtrl::fork, "/api/snippets/{id}/fork", drogon::Post);
    ADD_METHOD_TO(SnippetsCtrl::bulkMove, "/api/snippets/bulk-move",
                  drogon::Post);
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void get(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
              const std::string& id);
    void create(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void update(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id);
    void remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id);
    void share(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
               const std::string& id);
    void unshare(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                 const std::string& id);
    void getShared(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                    const std::string& token);
    void forkShared(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                     const std::string& token);
    void revisions(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                    const std::string& id);
    void revert(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id, const std::string& revId);
    void fork(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
              const std::string& id);
    void bulkMove(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
};

} // namespace pastebin
