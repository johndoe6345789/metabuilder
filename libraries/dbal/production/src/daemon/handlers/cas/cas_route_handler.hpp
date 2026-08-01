/**
 * @file cas_route_handler.hpp
 * @brief HTTP-shape layer for /cas/serviceValidate. All actual
 *        validation logic lives in CasService.
 */
#pragma once

#include "../../../cas/cas_service.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::cas {

class CasRouteHandler {
public:
    explicit CasRouteHandler(dbal::cas::CasService& service);

    /// GET /cas/serviceValidate?ticket=...&service=... — CAS 2.0 XML response.
    void handleServiceValidate(const drogon::HttpRequestPtr& req,
                                std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::cas::CasService& service_;
};

} // namespace dbal::daemon::handlers::cas
