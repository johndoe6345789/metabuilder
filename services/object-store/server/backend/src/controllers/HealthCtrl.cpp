/**
 * @file HealthCtrl.cpp
 * @brief Health check endpoint for S3 server.
 */

#include "HealthCtrl.h"

using namespace drogon;

namespace s3
{

void HealthCtrl::check(const HttpRequestPtr&,
                       std::function<void(const HttpResponsePtr&)>&& cb)
{
    auto r = HttpResponse::newHttpJsonResponse(Json::Value("ok"));
    cb(r);
}

} // namespace s3
