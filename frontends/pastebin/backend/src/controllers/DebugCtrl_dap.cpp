#include "DebugCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DebugSessionStore.hpp"

namespace pastebin {

void DebugCtrl::sendDap(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                         const std::string& sessionId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto session = DebugSessionStore::instance().get(sessionId);
    if (!session) {
        cb(errorResponse("Session not found", drogon::k404NotFound));
        return;
    }

    const auto body = req->getJsonObject();
    if (!body || !body->isObject()) {
        cb(errorResponse("Invalid JSON", drogon::k400BadRequest));
        return;
    }

    Json::StreamWriterBuilder writer;
    writer["indentation"] = "";
    if (!session->send(Json::writeString(writer, *body))) {
        cb(errorResponse("Session is closed", drogon::k409Conflict));
        return;
    }

    Json::Value out;
    out["ok"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
