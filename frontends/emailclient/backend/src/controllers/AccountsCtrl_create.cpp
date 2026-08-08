#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/EncryptedSecretClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void AccountsCtrl::create(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;

    const std::string password = body->get("password", "").asString();
    const std::string smtpPassword = body->get("smtpPassword", "").asString();
    if (password.empty() || smtpPassword.empty()) {
        cb(errorResponse("password and smtpPassword are required",
                          drogon::k400BadRequest));
        return;
    }

    const auto credentialId = createEncryptedSecret(password);
    const auto smtpCredentialId = createEncryptedSecret(smtpPassword);
    if (!credentialId || !smtpCredentialId) {
        cb(errorResponse("Failed to store credentials",
                          drogon::k500InternalServerError));
        return;
    }

    nlohmann::json entity;
    entity["userId"] = auth->userId;
    entity["tenantId"] = dbalTenant();
    entity["accountName"] = body->get("accountName", "").asString();
    entity["emailAddress"] = body->get("emailAddress", "").asString();
    entity["protocol"] = body->get("protocol", "imap").asString();
    entity["hostname"] = body->get("hostname", "").asString();
    entity["port"] = body->get("port", 993).asInt();
    entity["encryption"] = body->get("encryption", "tls").asString();
    entity["username"] = body->get("username", "").asString();
    entity["credentialId"] = *credentialId;
    entity["smtpHost"] = body->get("smtpHost", "").asString();
    entity["smtpPort"] = body->get("smtpPort", 587).asInt();
    entity["smtpEncryption"] = body->get("smtpEncryption", "tls").asString();
    entity["smtpUsername"] = body->get("smtpUsername", "").asString();
    entity["smtpCredentialId"] = *smtpCredentialId;

    const auto r = dbalRequest(
        "POST", "/" + dbalTenant() + "/email_client/EmailClient", &entity);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to create account",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(
        accountToJson(r->body.value("data", nlohmann::json::object())),
        drogon::k201Created));
}

} // namespace email_backend
