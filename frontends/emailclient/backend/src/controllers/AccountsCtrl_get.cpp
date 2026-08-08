#include "AccountsCtrl.h"
#include "AccountsCtrl_json.hpp"
#include "AuthHelpers.hpp"
#include "Helpers.hpp"
#include "../services/DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

void AccountsCtrl::get(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                        const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;
    if (id.empty()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }

    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() + "/email_client/EmailClient/" + id);
    if (!r || !r->ok()) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    const auto entity = r->body.value("data", nlohmann::json::object());
    if (entity.value("userId", "") != auth->userId) {
        cb(errorResponse("Account not found", drogon::k404NotFound));
        return;
    }
    cb(jsonResponse(accountToJson(entity)));
}

} // namespace email_backend
