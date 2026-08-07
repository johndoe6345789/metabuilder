/**
 * @file HealthCtrl.h
 * @brief Health check endpoint.
 */

#pragma once

#include <drogon/HttpController.h>

namespace pastebin {

class HealthCtrl : public drogon::HttpController<HealthCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(HealthCtrl::health, "/health", drogon::Get);
    METHOD_LIST_END

    void health(const drogon::HttpRequestPtr&,
                std::function<void(const drogon::HttpResponsePtr&)>&& cb);
};

} // namespace pastebin
