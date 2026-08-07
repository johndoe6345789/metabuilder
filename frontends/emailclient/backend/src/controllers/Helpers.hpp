#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>

#include <optional>
#include <string>

namespace email_backend {

/// Parses a path-param id string, requiring it to be a plain integer (no
/// trailing junk) -- mirrors Flask's `<int:...>` route converter, which
/// 404s rather than crashing on a malformed id.
inline std::optional<int> parseId(const std::string& id) {
    try {
        size_t pos = 0;
        int v = std::stoi(id, &pos);
        if (pos != id.size())
            return std::nullopt;
        return v;
    } catch (...) {
        return std::nullopt;
    }
}

inline std::string tenantId(const drogon::HttpRequestPtr& req) {
    auto v = req->getHeader("X-Tenant-Id");
    return v.empty() ? "default" : v;
}

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

/// Converts a libpq-formatted timestamp ("2026-01-01 12:00:00+00") into the
/// ISO-8601 shape ("2026-01-01T12:00:00Z") the old Flask API returned.
inline std::string pgTsToIso(const std::string& raw) {
    if (raw.empty())
        return raw;
    std::string s = raw;
    size_t sp = s.find(' ');
    if (sp != std::string::npos)
        s[sp] = 'T';
    if (s.size() >= 3 && s.compare(s.size() - 3, 3, "+00") == 0)
        s = s.substr(0, s.size() - 3) + "Z";
    return s;
}

/// Parses the request's JSON body. On missing/invalid body, calls `cb` with
/// the same 400 the Flask routes returned and returns false.
inline bool requireJsonBody(
    const drogon::HttpRequestPtr& req,
    const std::function<void(const drogon::HttpResponsePtr&)>& cb,
    std::shared_ptr<Json::Value>& out) {
    out = req->getJsonObject();
    if (!out || !out->isObject()) {
        cb(errorResponse("Request body required", drogon::k400BadRequest));
        return false;
    }
    return true;
}

} // namespace email_backend
