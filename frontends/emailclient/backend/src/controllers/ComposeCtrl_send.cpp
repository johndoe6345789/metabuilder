#include "ComposeCtrl.h"
#include "ComposeCtrl_send_helper.hpp"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void ComposeCtrl::send(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
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
    const std::string to = body->get("to", "").asString();
    const std::string subject = body->get("subject", "").asString();
    const std::string bodyText = body->get("body", "").asString();
    const std::string bodyHtml = body->get("bodyHtml", "").asString();
    const std::string cc = body->get("cc", "").asString();
    const std::string bcc = body->get("bcc", "").asString();
    const std::string replyTo = body->get("replyTo", "").asString();

    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailClient/" + accountId);
    if (!r || !r->ok()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto entity = r->body.value("data", nlohmann::json::object());
    if (entity.value("userId", "") != auth->userId) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    sendViaAccount(entity, to, subject, bodyText, bodyHtml, cc, bcc, replyTo,
                    cb);
}

} // namespace email_backend
