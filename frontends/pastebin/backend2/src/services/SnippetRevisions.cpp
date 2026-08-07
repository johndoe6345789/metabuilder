#include "SnippetRevisions.hpp"
#include "DbalClient.hpp"
#include "Uuid.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

bool matchesLastRevision(const nlohmann::json& lastRev, const std::string& code,
                          const std::string& filesJson) {
    const nlohmann::json filesValue =
        filesJson.empty() ? nlohmann::json(nullptr) : nlohmann::json(filesJson);
    return lastRev.value("code", "") == code &&
           lastRev.value("files", nlohmann::json(nullptr)) == filesValue;
}

} // namespace

void maybeSaveRevision(const std::string& snippetId, const std::string& code,
                        const std::string& filesJson,
                        const std::string& userId) {
    const auto lastR = dbalRequest(
        "GET", "/" + dbalTenant() + "/pastebin/SnippetRevision?filter.snippetId=" +
                   snippetId + "&sort=-createdAt&limit=1");
    if (lastR && lastR->ok()) {
        const auto items =
            lastR->body.value("data", lastR->body).value("data", nlohmann::json::array());
        if (!items.empty() && matchesLastRevision(items.front(), code, filesJson))
            return;
    }

    nlohmann::json body;
    body["id"] = generateUuidV4();
    body["snippetId"] = snippetId;
    body["code"] = code;
    body["files"] = filesJson.empty() ? nlohmann::json(nullptr) : nlohmann::json(filesJson);
    body["createdAt"] = nowEpochMillis();
    body["userId"] = userId;
    body["tenantId"] = dbalTenant();
    dbalRequest("POST", "/" + dbalTenant() + "/pastebin/SnippetRevision", &body);
}

} // namespace pastebin
