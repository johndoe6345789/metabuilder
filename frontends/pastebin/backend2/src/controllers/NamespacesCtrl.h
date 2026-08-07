/**
 * @file NamespacesCtrl.h
 * @brief Namespace CRUD endpoints.
 */

#pragma once

#include "Helpers.hpp"

#include <drogon/HttpController.h>

namespace pastebin {

class NamespacesCtrl : public drogon::HttpController<NamespacesCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(NamespacesCtrl::list, "/api/namespaces", drogon::Get);
    ADD_METHOD_TO(NamespacesCtrl::create, "/api/namespaces", drogon::Post);
    ADD_METHOD_TO(NamespacesCtrl::remove, "/api/namespaces/{id}",
                  drogon::Delete);
    ADD_METHOD_TO(NamespacesCtrl::update, "/api/namespaces/{id}",
                  drogon::Put);
    METHOD_LIST_END

    void list(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void create(const drogon::HttpRequestPtr& req, ResponseCb&& cb);
    void remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id);
    void update(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                const std::string& id);
};

} // namespace pastebin
