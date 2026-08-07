/**
 * @file HealthCtrl.h
 * @brief Health and version endpoints.
 */

#pragma once

#include <drogon/HttpController.h>

namespace email_backend {

class HealthCtrl : public drogon::HttpController<HealthCtrl> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(HealthCtrl::health, "/health", drogon::Get);
    ADD_METHOD_TO(HealthCtrl::version, "/version", drogon::Get);
    METHOD_LIST_END

    void health(const drogon::HttpRequestPtr&,
                std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
        Json::Value out;
        out["service"] = "email-service";
        out["status"] = "healthy";
        cb(drogon::HttpResponse::newHttpJsonResponse(out));
    }

    void version(const drogon::HttpRequestPtr&,
                 std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
        Json::Value out;
        out["service"] = "Email Service";
        out["version"] = "1.0.0";
        cb(drogon::HttpResponse::newHttpJsonResponse(out));
    }
};

} // namespace email_backend
