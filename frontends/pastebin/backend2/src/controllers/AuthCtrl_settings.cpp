#include "AuthCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbSettings.hpp"
#include "../util.hpp"

namespace pastebin {

void AuthCtrl::getSettings(const drogon::HttpRequestPtr& req,
                            ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const std::string json = getUserSettingsJson(auth->userId);
    auto r = drogon::HttpResponse::newHttpResponse();
    r->setContentTypeCode(drogon::CT_APPLICATION_JSON);
    r->setBody(json);
    cb(r);
}

void AuthCtrl::putSettings(const drogon::HttpRequestPtr& req,
                            ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    Json::StreamWriterBuilder writer;
    writer["indentation"] = "";
    const std::string json = body ? Json::writeString(writer, *body) : "{}";

    putUserSettingsJson(auth->userId, json, nowEpochMillis());
    cb(jsonResponse(body ? *body : Json::Value(Json::objectValue)));
}

} // namespace pastebin
