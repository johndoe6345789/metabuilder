#include "DebugCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DebugSessionStore.hpp"

#include <json/reader.h>

#include <sstream>

namespace pastebin {

namespace {

Json::Value toJson(const std::vector<std::string>& rawMessages) {
    Json::Value arr(Json::arrayValue);
    Json::CharReaderBuilder reader;
    for (const auto& raw : rawMessages) {
        Json::Value msg;
        std::string errs;
        std::istringstream stream(raw);
        if (Json::parseFromStream(reader, stream, &msg, &errs))
            arr.append(msg);
    }
    return arr;
}

} // namespace

void DebugCtrl::poll(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                      const std::string& sessionId) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto session = DebugSessionStore::instance().get(sessionId);
    if (!session) {
        cb(errorResponse("Session not found", drogon::k404NotFound));
        return;
    }

    const auto offsetParam = req->getParameter("offset");
    const size_t offset =
        offsetParam.empty() ? 0
                            : static_cast<size_t>(std::stoul(offsetParam));

    Json::Value out;
    out["messages"] = toJson(session->messagesSince(offset));
    out["done"] = session->done();
    cb(jsonResponse(out));
}

} // namespace pastebin
