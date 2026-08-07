#include "SnippetsCtrl.h"
#include "AuthHelpers.hpp"
#include "../services/DbalClient.hpp"
#include "../services/JsonConvert.hpp"
#include "../services/SnippetJson.hpp"
#include "../services/SnippetOwnership.hpp"
#include "../services/SnippetRevisions.hpp"

namespace pastebin {

namespace {

bool hasRequiredFields(const Json::Value& data) {
    for (const char* field : {"title", "code", "language"}) {
        if (!data.isMember(field) || data[field].asString().empty())
            return false;
    }
    return true;
}

std::string serializedFiles(const Json::Value& data) {
    if (!data.isMember("files") || data["files"].isNull())
        return "";
    Json::StreamWriterBuilder w;
    w["indentation"] = "";
    return Json::writeString(w, data["files"]);
}

} // namespace

void SnippetsCtrl::update(const drogon::HttpRequestPtr& req, ResponseCb&& cb,
                           const std::string& id) {
    const auto auth = requireAuth(req, cb);
    if (!auth)
        return;

    std::shared_ptr<Json::Value> body;
    if (!requireJsonBody(req, cb, body))
        return;
    if (!hasRequiredFields(*body)) {
        cb(errorResponse("title, code, and language are required",
                          drogon::k400BadRequest));
        return;
    }
    if (!getOwnedSnippet(id, auth->userId)) {
        cb(errorResponse("Snippet not found", drogon::k404NotFound));
        return;
    }

    const auto dbalBody = buildSnippetBody(*body, auth->userId, false, false);
    const auto r = dbalRequest(
        "PUT", "/" + dbalTenant() + "/pastebin/Snippet/" + id, &dbalBody);
    if (!r || !r->ok()) {
        cb(errorResponse("Failed to update snippet",
                          drogon::k500InternalServerError));
        return;
    }
    maybeSaveRevision(id, (*body)["code"].asString(), serializedFiles(*body),
                       auth->userId);
    cb(jsonResponse(nlohmannToJsoncpp(
        normalizeSnippet(r->body.value("data", dbalBody)))));
}

} // namespace pastebin
