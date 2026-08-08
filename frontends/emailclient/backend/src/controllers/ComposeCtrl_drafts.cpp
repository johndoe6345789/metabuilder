#include "ComposeCtrl.h"
#include "ComposeCtrl_json.hpp"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/EnsureFolder.hpp"
#include "../services/Uuid.hpp"
#include "../util_env.hpp"

namespace email_backend {

void ComposeCtrl::listDrafts(const drogon::HttpRequestPtr& req,
                              ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto accounts =
        dbalAllPages("/" + dbalTenant() +
                     "/email_client/EmailClient?filter.userId=" +
                     auth->userId);

    Json::Value out(Json::arrayValue);
    for (const auto& account : accounts) {
        const std::string accountId = account.value("id", "");
        const auto folderId = ensureFolder(accountId, "Drafts", "drafts");
        if (!folderId)
            continue;
        const auto drafts = dbalAllPages(
            "/" + dbalTenant() +
            "/email_client/EmailMessage?filter.folderId=" + *folderId);
        for (const auto& msg : drafts)
            out.append(messageToJson(msg));
    }
    cb(jsonResponse(out));
}

void ComposeCtrl::saveDraft(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    if (!body->isMember("accountId")) {
        cb(errorResponse("accountId required", drogon::k400BadRequest));
        return;
    }
    const std::string accountId = (*body)["accountId"].asString();

    const auto folderId = ensureFolder(accountId, "Drafts", "drafts");
    if (!folderId) {
        cb(errorResponse("Failed to prepare drafts folder",
                          drogon::k500InternalServerError));
        return;
    }

    const std::string to = body->get("to", "").asString();
    const std::string cc = body->get("cc", "").asString();

    nlohmann::json entity;
    entity["tenantId"] = dbalTenant();
    entity["emailClientId"] = accountId;
    entity["folderId"] = *folderId;
    entity["messageId"] = "draft:" + generateUuidV4();
    entity["from"] = body->get("from", "").asString();
    entity["to"] = to.empty() ? nlohmann::json::array()
                               : nlohmann::json::array({to});
    if (!cc.empty())
        entity["cc"] = nlohmann::json::array({cc});
    entity["subject"] = body->get("subject", "").asString();
    entity["textBody"] = body->get("body", "").asString();
    entity["htmlBody"] = body->get("bodyHtml", "").asString();
    entity["receivedAt"] = nowEpochMillis();
    entity["isDraft"] = true;

    const auto r = dbalRequest(
        "POST", "/" + dbalTenant() + "/email_client/EmailMessage", &entity);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to save draft",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(
        messageToJson(r->body.value("data", nlohmann::json::object())),
        drogon::k201Created));
}

} // namespace email_backend
