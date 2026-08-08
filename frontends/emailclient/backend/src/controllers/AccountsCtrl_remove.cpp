#include "AccountsCtrl.h"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void AccountsCtrl::remove(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                           const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (id.empty()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    const auto existing = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailClient/" + id);
    if (!existing || !existing->ok() ||
        existing->body.value("data", nlohmann::json::object())
                .value("userId", "") != auth->userId) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    const auto r = dbalRequest(
        "DELETE", "/" + dbalTenant() + "/email_client/EmailClient/" + id);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to delete account",
                          drogon::k500InternalServerError));
        return;
    }
    Json::Value out;
    out["deleted"] = true;
    cb(jsonResponse(out));
}

} // namespace email_backend
