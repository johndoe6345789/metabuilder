/**
 * @file AuthFilter.cpp
 * @brief DBAL OIDC bearer-token authentication filter implementations.
 */

#include "AuthFilter.h"
#include "../services/Globals.h"

#include <drogon/HttpClient.h>
#include <drogon/HttpResponse.h>

using namespace drogon;

namespace repo
{

namespace
{

/// @brief Maps a DBAL role claim onto this app's read/write/admin scopes.
/// Any authenticated DBAL user can read/write packages; admin-tier roles
/// additionally get the "admin" scope (repo config, adapter management).
Json::Value scopesForRole(const std::string& role)
{
    Json::Value scopes(Json::arrayValue);
    scopes.append("read");
    scopes.append("write");
    if (role == "admin" || role == "god" || role == "supergod")
        scopes.append("admin");
    return scopes;
}

HttpResponsePtr unauthorized(const std::string& msg)
{
    Json::Value err;
    err["error"]["code"] = "UNAUTHORIZED";
    err["error"]["message"] = msg;
    auto resp = HttpResponse::newHttpJsonResponse(err);
    resp->setStatusCode(k401Unauthorized);
    return resp;
}

/// @brief Verifies a bearer token against DBAL's /oidc/userinfo and, on
/// success, invokes `onOk` with a principal JSON ({sub, scopes}) shaped
/// like the app's other consumers (AuthCtrl::me, RegistryAuth::hasScope)
/// already expect. Invokes `onFail` otherwise.
void verifyBearer(const std::string& token,
                   std::function<void(Json::Value)>&& onOk,
                   std::function<void()>&& onFail)
{
    auto client = HttpClient::newHttpClient(Globals::dbalUrl);
    auto req = HttpRequest::newHttpRequest();
    req->setMethod(Get);
    req->setPath("/oidc/userinfo");
    req->addHeader("Authorization", "Bearer " + token);

    client->sendRequest(
        req,
        [onOk = std::move(onOk), onFail = std::move(onFail)](
            ReqResult result, const HttpResponsePtr& resp) mutable {
            if (result != ReqResult::Ok || !resp ||
                resp->statusCode() != k200OK) {
                onFail();
                return;
            }
            auto json = resp->getJsonObject();
            if (!json || !(*json)["sub"].isString()) {
                onFail();
                return;
            }
            Json::Value principal;
            principal["sub"] = (*json)["sub"];
            principal["scopes"] =
                scopesForRole((*json)["role"].asString());
            onOk(std::move(principal));
        },
        10.0);
}

} // namespace

void AuthFilter::doFilter(const HttpRequestPtr& req, FilterCallback&& cb,
                          FilterChainCallback&& ccb)
{
    auto auth = req->getHeader("Authorization");
    if (auth.substr(0, 7) != "Bearer ") {
        cb(unauthorized("Missing or invalid token"));
        return;
    }
    verifyBearer(
        auth.substr(7),
        [req, ccb = std::move(ccb)](Json::Value principal) mutable {
            req->attributes()->insert("principal", std::move(principal));
            ccb();
        },
        [cb = std::move(cb)]() mutable {
            cb(unauthorized("Missing or invalid token"));
        });
}

void OptionalAuthFilter::doFilter(const HttpRequestPtr& req,
                                  FilterCallback&&,
                                  FilterChainCallback&& ccb)
{
    auto auth = req->getHeader("Authorization");
    if (auth.substr(0, 7) != "Bearer ") {
        Json::Value anon;
        anon["sub"] = "anonymous";
        anon["scopes"].append("read");
        req->attributes()->insert("principal", anon);
        ccb();
        return;
    }
    verifyBearer(
        auth.substr(7),
        [req, ccb](Json::Value principal) mutable {
            req->attributes()->insert("principal", std::move(principal));
            ccb();
        },
        [req, ccb]() mutable {
            Json::Value anon;
            anon["sub"] = "anonymous";
            anon["scopes"].append("read");
            req->attributes()->insert("principal", anon);
            ccb();
        });
}

} // namespace repo
