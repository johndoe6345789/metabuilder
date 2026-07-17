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

    // The web client uses an intentionally small internal credential scheme:
    // "AWS access_key:secret_key". This is not AWS Signature V4, so reject
    // ambiguous bearer credentials instead of pretending they are equivalent.
    std::string key;
    std::string suppliedSecret;
    if (auth.starts_with("AWS ")) {
        auto colon = auth.find(':', 4);
        if (colon == std::string::npos) {
            auto r = HttpResponse::newHttpResponse();
            r->setStatusCode(k403Forbidden);
            r->setBody("InvalidAuthorizationHeader");
            cb(r);
            return;
        }
        key = auth.substr(4, colon - 4);
        suppliedSecret = auth.substr(colon + 1);
    } else {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k403Forbidden);
        r->setBody("InvalidAuthorizationHeader");
        cb(r);
        return;
    }

    try {
        auto rows =
            DbPool::get()->execSqlSync("SELECT access_key, secret_key, owner, permissions "
                                       "FROM api_keys WHERE access_key=$1",
                                       key);
        if (rows.empty() || rows[0]["secret_key"].as<std::string>() != suppliedSecret) {
            auto r = HttpResponse::newHttpResponse();
            r->setStatusCode(k403Forbidden);
            r->setBody("InvalidAccessKeyId");
            cb(r);
            return;
        }
        const auto permissions = rows[0]["permissions"].as<std::string>();
        const bool isRead = req->getMethod() == Get || req->getMethod() == Head;
        const auto required = isRead ? "read" : "write";
        if (permissions.find(required) == std::string::npos &&
            permissions.find("admin") == std::string::npos) {
            auto r = HttpResponse::newHttpResponse();
            r->setStatusCode(k403Forbidden);
            r->setBody("AccessDenied");
            cb(r);
            return;
        }
        req->attributes()->insert("access_key", key);
        req->attributes()->insert(
            "owner", rows[0]["owner"].as<std::string>());
        ccb();
    } catch (...) {
        auto r = HttpResponse::newHttpResponse();
        r->setStatusCode(k500InternalServerError);
        cb(r);
    }
}

} // namespace s3
