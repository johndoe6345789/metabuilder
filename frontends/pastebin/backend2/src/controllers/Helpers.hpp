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

} // namespace pastebin
