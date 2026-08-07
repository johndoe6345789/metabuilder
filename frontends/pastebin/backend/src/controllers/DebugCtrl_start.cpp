#include "DebugCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DebugLaunchArgs.hpp"
#include "../services/DebugRunnerRegistry.hpp"
#include "../services/DebugSessionStore.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/ParseRunRequest.hpp"
#include "../services/Uuid.hpp"

namespace pastebin {

void DebugCtrl::start(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    DebugSessionStore::instance().reap(300); // _DEBUG_SESSION_TTL

    const auto body = req->getJsonObject();
    const auto parsed =
        parseRunRequest(body ? *body : Json::Value(Json::objectValue));
    if (parsed.files.empty()) {
        cb(errorResponse("No files provided", drogon::k400BadRequest));
        return;
    }
    if (!findDebugRunner(parsed.language)) {
        cb(errorResponse("Debug not supported for " + parsed.language,
                          drogon::k400BadRequest));
        return;
    }

    const std::string sessionId = generateUuidV4();
    auto session = DebugSessionStore::instance().create(sessionId);
    try {
        session->start(parsed.language, parsed.entryPoint, parsed.files);
    } catch (const std::exception& e) {
        DebugSessionStore::instance().remove(sessionId);
        cb(errorResponse(e.what(), drogon::k500InternalServerError));
        return;
    }

    Json::Value out;
    out["session_id"] = sessionId;
    out["launch_args"] = nlohmannToJsoncpp(
        buildDebugLaunchArgs(parsed.language, parsed.entryPoint));
    cb(jsonResponse(out, drogon::k201Created));
}

} // namespace pastebin
