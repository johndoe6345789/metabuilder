#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>

#include <functional>
#include <string>

namespace pastebin {

using ResponseCb = std::function<void(const drogon::HttpResponsePtr&)>;

inline drogon::HttpResponsePtr jsonResponse(
    const Json::Value& v, drogon::HttpStatusCode code = drogon::k200OK) {
    auto r = drogon::HttpResponse::newHttpJsonResponse(v);
    r->setStatusCode(code);
    return r;
}

inline drogon::HttpResponsePtr errorResponse(const std::string& msg,
                                              drogon::HttpStatusCode code) {
    Json::Value e;
    e["error"] = msg;
    return jsonResponse(e, code);
}

/// Parses the request's JSON body. On missing/invalid body, calls `cb`
/// with a 400 and returns false.
inline bool requireJsonBody(const drogon::HttpRequestPtr& req,
                             const ResponseCb& cb,
                             std::shared_ptr<Json::Value>& out) {
    out = req->getJsonObject();
    if (!out || !out->isObject()) {
        cb(errorResponse("Request body required", drogon::k400BadRequest));
        return false;
    }
    return true;
}

} // namespace pastebin
