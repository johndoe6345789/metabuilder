#include "AuthCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbSettings.hpp"

#include <chrono>

namespace pastebin {

namespace {

int64_t nowMillis() {
    using namespace std::chrono;
    return duration_cast<milliseconds>(system_clock::now().time_since_epoch())
        .count();
}

} // namespace

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
    const std::string json =
        body ? Json::writeString(writer, *body) : "{}";

    putUserSettingsJson(auth->userId, json, nowMillis());
    cb(jsonResponse(body ? *body : Json::Value(Json::objectValue)));
}

} // namespace pastebin
