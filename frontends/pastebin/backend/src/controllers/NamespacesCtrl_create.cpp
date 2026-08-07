#include "NamespacesCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/NamespaceJson.hpp"
#include "../services/TimeCoerce.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

bool nameIsBlank(const Json::Value& v) {
    const std::string name = v.asString();
    return name.find_first_not_of(" \t\n\r") == std::string::npos;
}

} // namespace

void NamespacesCtrl::create(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    if (!body->isMember("name") || nameIsBlank((*body)["name"])) {
        cb(errorResponse("name is required", drogon::k400BadRequest));
        return;
    }

    nlohmann::json dbalBody;
    dbalBody["id"] = (*body)["id"].asString();
    dbalBody["name"] = (*body)["name"].asString();
    dbalBody["isDefault"] = body->get("isDefault", false).asBool();
    dbalBody["createdAt"] = coerceEpochMillis((*body)["createdAt"]);
    dbalBody["userId"] = auth->userId;
    dbalBody["tenantId"] = dbalTenant();

    const auto r = dbalRequest(
        "POST", "/" + dbalTenant() + "/pastebin/Namespace", &dbalBody);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to create namespace",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(
        nlohmannToJsoncpp(normalizeNamespace(r->body.value("data", dbalBody))),
        drogon::k201Created));
}

} // namespace pastebin
