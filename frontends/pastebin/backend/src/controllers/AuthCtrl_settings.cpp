#include "AuthCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/PastebinSettingsPath.hpp"
#include "../util.hpp"

namespace pastebin {

void AuthCtrl::getSettings(const drogon::HttpRequestPtr& req,
                            ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto r = dbalRequest("GET", pastebinSettingsPath(auth->userId));
    if (!r || !r->ok()) {
        cb(jsonResponse(Json::Value(Json::objectValue)));
        return;
    }

    const auto entity = r->body.value("data", r->body);
    const std::string settingsJson = entity.value("settingsJson", "{}");
    cb(jsonResponse(nlohmannToJsoncpp(nlohmann::json::parse(settingsJson))));
}

void AuthCtrl::putSettings(const drogon::HttpRequestPtr& req,
                            ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    Json::StreamWriterBuilder writer;
    writer["indentation"] = "";
    const std::string settingsJson =
        body ? Json::writeString(writer, *body) : "{}";

    nlohmann::json patch;
    patch["settingsJson"] = settingsJson;
    auto r = dbalRequest("PUT", pastebinSettingsPath(auth->userId), &patch);

    if (!r || !r->ok()) {
        // No row yet for this user -- create it.
        nlohmann::json data;
        data["id"] = auth->userId;
        data["tenantId"] = dbalTenant();
        data["settingsJson"] = settingsJson;
        r = dbalRequest("POST", "/" + dbalTenant() + "/pastebin/PastebinSettings",
                         &data);
    }

    if (!r || !r->ok()) {
        cb(errorResponse("Failed to save settings",
                          drogon::k500InternalServerError));
        return;
    }
    cb(jsonResponse(body ? *body : Json::Value(Json::objectValue)));
}

} // namespace pastebin
