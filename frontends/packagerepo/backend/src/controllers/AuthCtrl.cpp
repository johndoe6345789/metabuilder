/**
 * @file AuthCtrl.cpp
 * @brief Authentication endpoint implementations.
 */

#include "AuthCtrl.h"
#include "../services/PgUserStore.h"
#include "../services/RegistryAuth.h"

using namespace drogon;

namespace repo
{

void AuthCtrl::me(const HttpRequestPtr& req,
                  std::function<void(const HttpResponsePtr&)>&& cb)
{
    auto p = req->attributes()->get<Json::Value>("principal");
    Json::Value out;
    out["ok"] = true;
    out["user"]["username"] = p["sub"];
    out["user"]["scopes"] = p["scopes"];
    cb(HttpResponse::newHttpJsonResponse(out));
}

void AuthCtrl::changePassword(const HttpRequestPtr& req,
                              std::function<void(const HttpResponsePtr&)>&& cb)
{
    auto p = req->attributes()->get<Json::Value>("principal");

    // The Docker CLI (`docker login`) authenticates with a single shared
    // "admin" credential in the separate PgUserStore, not per-DBAL-user --
    // this rotates that credential, gated on an admin-tier DBAL role,
    // rather than changing the caller's own (nonexistent, in PgUserStore)
    // password.
    if (!registry_auth::hasScope(p, "admin")) {
        Json::Value err;
        err["error"]["code"] = "FORBIDDEN";
        err["error"]["message"] = "Admin role required";
        auto r = HttpResponse::newHttpJsonResponse(err);
        r->setStatusCode(k403Forbidden);
        cb(r);
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json)["old_password"].isString() ||
        !(*json)["new_password"].isString()) {
        Json::Value err;
        err["error"]["code"] = "INVALID_REQUEST";
        err["error"]["message"] = "Missing passwords";
        auto r = HttpResponse::newHttpJsonResponse(err);
        r->setStatusCode(k400BadRequest);
        cb(r);
        return;
    }

    bool ok = PgUserStore::changePass("admin",
                                      (*json)["old_password"].asString(),
                                      (*json)["new_password"].asString());

    Json::Value out;
    if (ok) {
        out["ok"] = true;
        out["message"] = "Docker registry login credential changed";
    } else {
        out["error"]["code"] = "INVALID_PASSWORD";
        out["error"]["message"] = "Old password incorrect";
    }
    auto r = HttpResponse::newHttpJsonResponse(out);
    if (!ok)
        r->setStatusCode(k401Unauthorized);
    cb(r);
}

} // namespace repo
