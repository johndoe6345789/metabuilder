#include "InteractiveCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/SessionStore.hpp"

namespace pastebin {

void InteractiveCtrl::input(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb, const std::string& sessionId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto session = SessionStore::instance().get(sessionId);
    if (!session) {
        cb(errorResponse("Session not found", drogon::k404NotFound));
        return;
    }

    const auto body = req->getJsonObject();
    const std::string value =
        body && body->isMember("value") ? (*body)["value"].asString() : "";

    if (!session->sendInput(value)) {
        cb(errorResponse("Session is not waiting for input",
                          drogon::k409Conflict));
        return;
    }

    Json::Value out;
    out["ok"] = true;
    cb(jsonResponse(out));
}

} // namespace pastebin
