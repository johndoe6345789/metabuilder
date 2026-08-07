#include "HealthCtrl.h"
#include "../util.hpp"

namespace pastebin {

void HealthCtrl::health(
    const drogon::HttpRequestPtr&,
    std::function<void(const drogon::HttpResponsePtr&)>&& cb) {
    Json::Value out;
    out["status"] = "healthy";
    out["timestamp"] = nowIso();
    cb(drogon::HttpResponse::newHttpJsonResponse(out));
}

} // namespace pastebin
