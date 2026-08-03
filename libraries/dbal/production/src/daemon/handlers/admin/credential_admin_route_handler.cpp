/**
 * @file credential_admin_route_handler.cpp
 */
#include "credential_admin_route_handler.hpp"
#include "../../../security/crypto/timing_safe_equal.hpp"

#include <cstdlib>
#include <cstring>
#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal::daemon::handlers::admin {

namespace {
bool validateAdminAuth(const drogon::HttpRequestPtr& req,
                        std::function<void(const drogon::HttpResponsePtr&)>& cb) {
    const char* expected = std::getenv("DBAL_ADMIN_TOKEN");
    if (!expected || std::strlen(expected) == 0) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Admin endpoints are disabled (no DBAL_ADMIN_TOKEN configured)";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k403Forbidden);
        cb(resp);
        return false;
    }
    auto authHeader = req->getHeader("Authorization");
    if (!dbal::security::timing_safe_equal(authHeader, std::string("Bearer ") + expected)) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Unauthorized";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k401Unauthorized);
        cb(resp);
        return false;
    }
    return true;
}
} // namespace

CredentialAdminRouteHandler::CredentialAdminRouteHandler(dbal::Client& client) : client_(client) {}

void CredentialAdminRouteHandler::handleSetCredential(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    if (!validateAdminAuth(req, cb)) {
        return;
    }

    auto jsonPtr = req->getJsonObject();
    if (!jsonPtr) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Invalid JSON body";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k400BadRequest);
        cb(resp);
        return;
    }

    const auto& json = *jsonPtr;
    std::string username = json.get("username", "").asString();
    std::string password = json.get("password", "").asString();

    if (username.empty() || password.empty()) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Both 'username' and 'password' are required";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k400BadRequest);
        cb(resp);
        return;
    }

    dbal::CreateCredentialInput input;
    input.username = username;
    input.passwordHash = password; // legacy field name — holds the plaintext to be hashed, see client_misc_ops.cpp
    input.tenantId = json.get("tenantId", "").asString(); // optional; falls back to "system" if omitted

    auto result = client_.setCredential(input);
    if (result.isError()) {
        spdlog::warn("[admin] Failed to set credential for '{}': {}", username, result.error().what());
        ::Json::Value body;
        body["success"] = false;
        body["error"] = result.error().what();
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k400BadRequest);
        cb(resp);
        return;
    }

    spdlog::info("[admin] Credential set for username '{}'", username);
    ::Json::Value body;
    body["success"] = true;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    cb(resp);
}

} // namespace dbal::daemon::handlers::admin
