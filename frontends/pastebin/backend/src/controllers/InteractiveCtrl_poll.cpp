#include "InteractiveCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/SessionStore.hpp"

namespace pastebin {

namespace {

Json::Value toJson(const std::vector<SessionOutputEntry>& entries) {
    Json::Value arr(Json::arrayValue);
    for (const auto& e : entries) {
        Json::Value item;
        item["type"] = e.type;
        item["text"] = e.text;
        arr.append(item);
    }
    return arr;
}

} // namespace

void InteractiveCtrl::poll(const drogon::HttpRequestPtr& req,
                            ResponseCb&& cb, const std::string& sessionId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto session = SessionStore::instance().get(sessionId);
    if (!session) {
        cb(errorResponse("Session not found", drogon::k404NotFound));
        return;
    }

    const auto offsetParam = req->getParameter("offset");
    const size_t offset =
        offsetParam.empty() ? 0
                            : static_cast<size_t>(std::stoul(offsetParam));

    Json::Value out;
    out["output"] = toJson(session->outputSince(offset));
    out["waiting_for_input"] = session->waitingForInput();
    out["done"] = session->done();
    cb(jsonResponse(out));
}

} // namespace pastebin
