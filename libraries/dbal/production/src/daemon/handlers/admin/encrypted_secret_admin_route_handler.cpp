/**
 * @file encrypted_secret_admin_route_handler.cpp
 */
#include "encrypted_secret_admin_route_handler.hpp"
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

void sendError(const std::function<void(const drogon::HttpResponsePtr&)>& cb,
               drogon::HttpStatusCode code, const std::string& message) {
    ::Json::Value body;
    body["success"] = false;
    body["error"] = message;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    cb(resp);
}

} // namespace

EncryptedSecretAdminRouteHandler::EncryptedSecretAdminRouteHandler(dbal::Client& client)
    : client_(client) {}

void EncryptedSecretAdminRouteHandler::handleCreate(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    if (!validateAdminAuth(req, cb)) {
        return;
    }

    auto jsonPtr = req->getJsonObject();
    if (!jsonPtr) {
        sendError(cb, drogon::k400BadRequest, "Invalid JSON body");
        return;
    }

    const std::string plaintext = jsonPtr->get("plaintext", "").asString();
    const std::string tenantId = jsonPtr->get("tenantId", "").asString();

    auto result = client_.createEncryptedSecret(tenantId, plaintext);
    if (result.isError()) {
        spdlog::warn("[admin] Failed to create encrypted secret: {}", result.error().what());
        sendError(cb, drogon::k400BadRequest, result.error().what());
        return;
    }

    ::Json::Value body;
    body["success"] = true;
    body["id"] = result.value();
    cb(drogon::HttpResponse::newHttpJsonResponse(body));
}

void EncryptedSecretAdminRouteHandler::handleReveal(
    const drogon::HttpRequestPtr& req, std::function<void(const drogon::HttpResponsePtr&)>&& cb,
    const std::string& id) {
    if (!validateAdminAuth(req, cb)) {
        return;
    }

    auto result = client_.revealEncryptedSecret(id);
    if (result.isError()) {
        spdlog::warn("[admin] Failed to reveal secret '{}': {}", id, result.error().what());
        sendError(cb, drogon::k404NotFound, result.error().what());
        return;
    }

    ::Json::Value body;
    body["success"] = true;
    body["plaintext"] = result.value();
    cb(drogon::HttpResponse::newHttpJsonResponse(body));
}

} // namespace dbal::daemon::handlers::admin
