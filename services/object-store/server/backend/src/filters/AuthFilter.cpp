/**
 * @file AuthFilter.cpp
 * @brief Simple access-key auth via Authorization header.
 */

#include "AuthFilter.h"
#include "../services/DbPool.h"

using namespace drogon;

namespace s3
{

void AuthFilter::doFilter(const HttpRequestPtr& req, FilterCallback&& cb,
                          FilterChainCallback&& ccb)
{
    auto auth = req->getHeader("Authorization");
    if (auth.empty()) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k403Forbidden);
        r->setBody("AccessDenied");
        cb(r);
        return;
    }

    // Accept "AWS access_key:sig" or "Bearer key"
    std::string key;
    if (auth.starts_with("AWS ")) {
        auto colon = auth.find(':', 4);
        key = (colon != std::string::npos) ? auth.substr(4, colon - 4)
                                           : auth.substr(4);
    } else if (auth.starts_with("Bearer ")) {
        key = auth.substr(7);
    } else {
        key = auth;
    }

    try {
        auto rows =
            DbPool::get()->execSqlSync("SELECT access_key, permissions "
                                       "FROM api_keys WHERE access_key=$1",
                                       key);
        if (rows.empty()) {
            auto r = HttpResponse::newHttpResponse();
            r->setStatusCode(k403Forbidden);
            r->setBody("InvalidAccessKeyId");
            cb(r);
            return;
        }
        req->attributes()->insert("access_key", key);
        ccb();
    } catch (...) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k500InternalServerError);
        cb(r);
    }
}

} // namespace s3
