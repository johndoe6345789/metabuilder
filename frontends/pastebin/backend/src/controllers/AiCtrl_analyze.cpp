#include "AiCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/AiProviderClient.hpp"
#include "../services/Base64.hpp"
#include "../services/DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

// Prefers the user's stored (base64-obfuscated) key for `platformId`;
// falls back to a client-provided key for platforms without one stored.
std::string resolveApiKey(const std::string& userId,
                           const std::string& platformId,
                           const std::string& clientProvidedKey) {
    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/core/User/" + userId);
    if (r && r->ok()) {
        const auto user = r->body.value("data", r->body);
        const auto storedKey = user.value("aiKey", "");
        if (!storedKey.empty() &&
            user.value("aiPlatform", "") == platformId) {
            if (const auto decoded = decodeBase64(storedKey))
                return *decoded;
        }
    }
    return clientProvidedKey;
}

} // namespace

void AiCtrl::analyze(const drogon::HttpRequestPtr& req, ResponseCb&& cb) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    const auto body = req->getJsonObject();
    const auto field = [&](const char* name) {
        return body && body->isMember(name) ? (*body)[name].asString() : "";
    };
    const std::string platformId = field("platformId");
    const std::string apiFormat = field("apiFormat");
    const std::string endpoint = field("endpoint");
    const std::string model = field("model");
    const std::string prompt = field("prompt");

    if (platformId.empty() || prompt.empty()) {
        cb(errorResponse("platformId and prompt required",
                          drogon::k400BadRequest));
        return;
    }

    const std::string apiKey =
        resolveApiKey(auth->userId, platformId, field("apiKey"));
    if (apiKey.empty()) {
        cb(errorResponse("No API key configured", drogon::k400BadRequest));
        return;
    }

    const auto result =
        callAiProvider(apiFormat, endpoint, model, apiKey, prompt);
    if (!result.ok) {
        cb(errorResponse(result.error, drogon::k502BadGateway));
        return;
    }

    Json::Value out;
    out["result"] = result.text;
    cb(jsonResponse(out));
}

} // namespace pastebin
