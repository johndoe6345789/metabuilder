#include "InteractiveCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DockerImage.hpp"
#include "../services/ParseRunRequest.hpp"
#include "../services/RunnerRegistry.hpp"
#include "../services/SessionStore.hpp"
#include "../services/Uuid.hpp"

namespace pastebin {

void InteractiveCtrl::start(const drogon::HttpRequestPtr& req,
                             ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    SessionStore::instance().reap(120); // _SESSION_TTL from the old Flask

    const auto body = req->getJsonObject();
    const auto parsed =
        parseRunRequest(body ? *body : Json::Value(Json::objectValue));
    if (parsed.files.empty()) {
        cb(errorResponse("No code or files provided",
                          drogon::k400BadRequest));
        return;
    }

    const auto spec = findRunner(parsed.language);
    if (!spec) {
        cb(errorResponse("Unsupported language: " + parsed.language,
                          drogon::k400BadRequest));
        return;
    }

    dockerEnsureImage(runnerImage(*spec));

    const std::string sessionId = generateUuidV4();
    auto session = SessionStore::instance().create(sessionId);
    session->start(*spec, parsed.entryPoint, parsed.files);

    Json::Value out;
    out["session_id"] = sessionId;
    cb(jsonResponse(out, drogon::k201Created));
}

} // namespace pastebin
