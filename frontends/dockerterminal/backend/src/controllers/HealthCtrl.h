/**
 * @file HealthCtrl.h
 * @brief Health check endpoint.
 */

#pragma once

#include <drogon/HttpController.h>

namespace dockerterminal {

class HealthCtrl : public drogon::HttpController<HealthCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(HealthCtrl::health, "/api/health", drogon::Get);
    METHOD_LIST_END

    void health(const drogon::HttpRequestPtr&,
                std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
        Json::Value out;
        out["status"] = "healthy";
        cb(drogon::HttpResponse::newHttpJsonResponse(out));
    }
};

} // namespace dockerterminal
