/**
 * @file HealthCtrl.h
 * @brief Health check endpoint for S3 server.
 */

#pragma once

#include <drogon/HttpController.h>

namespace s3
{

/// @brief GET /health — liveness probe.
class HealthCtrl : public drogon::HttpController<HealthCtrl>
{
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(HealthCtrl::check, "/health", drogon::Get);
    METHOD_LIST_END

    void check(const drogon::HttpRequestPtr&,
               std::function<void(const drogon::HttpResponsePtr&)>&&);
};

} // namespace s3
