#include "NamespacesCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/NamespaceJson.hpp"
#include "../services/NamespaceOwnership.hpp"
#include "../util.hpp"

namespace pastebin {

void NamespacesCtrl::update(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb, const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto ns = getOwnedNamespace(id, auth->userId);
    if (!ns) {
        cb(errorResponse("Namespace not found", drogon::k404NotFound));
        return;
    }

    const auto body = req->getJsonObject();
    nlohmann::json dbalBody;
    dbalBody["name"] = (body && body->isMember("name"))
                            ? (*body)["name"].asString()
                            : ns->value("name", "");
    dbalBody["isDefault"] = ns->value("isDefault", false);
    dbalBody["userId"] = auth->userId;
    dbalBody["tenantId"] = dbalTenant();

    const auto r = dbalRequest(
        "PUT", "/" + dbalTenant() + "/pastebin/Namespace/" + id, &dbalBody);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to update namespace",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(nlohmannToJsoncpp(
        normalizeNamespace(r->body.value("data", nlohmann::json::object())))));
}

} // namespace pastebin
