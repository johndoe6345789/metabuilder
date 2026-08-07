#include "RunCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/ParseRunRequest.hpp"
#include "../services/RunLanguageExec.hpp"
#include "../services/RunnerRegistry.hpp"
#include "../services/SqlRunner.hpp"
#include "../services/UserRunTimeout.hpp"

namespace pastebin {

namespace {

drogon::HttpStatusCode toStatus(int code) {
    return static_cast<drogon::HttpStatusCode>(code);
}

} // namespace

void RunCtrl::run(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

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

    if (!spec->sqlRunner.empty()) {
        const auto result = runSqlInDocker(*spec, parsed.files);
        cb(jsonResponse(result.body, toStatus(result.status)));
        return;
    }

    const auto userTimeout = getUserRunTimeout(auth->userId);
    const auto result = runLanguageInDocker(*spec, parsed.entryPoint,
                                             parsed.files, userTimeout);
    cb(jsonResponse(result.body, toStatus(result.status)));
}

} // namespace pastebin
