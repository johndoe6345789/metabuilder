#include "SnippetFork.hpp"
#include "DbalClient.hpp"
#include "SnippetJson.hpp"
#include "Uuid.hpp"
#include "../util.hpp"

namespace pastebin {

std::pair<nlohmann::json, int> forkSnippet(const nlohmann::json& source,
                                            const std::string& newTitle,
                                            const std::string& userId) {
    nlohmann::json body;
    body["id"] = generateUuidV4();
    body["title"] = newTitle;
    body["description"] = source.value("description", "");
    body["code"] = source.value("code", "");
    body["language"] = source.value("language", "plaintext");
    body["category"] = source.value("category", "general");
    body["namespaceId"] = nullptr;
    body["hasPreview"] = source.value("hasPreview", false);
    body["functionName"] = source.value("functionName", nlohmann::json(nullptr));
    body["inputParameters"] =
        source.value("inputParameters", nlohmann::json(nullptr));
    body["files"] = source.value("files", nlohmann::json(nullptr));
    body["entryPoint"] = source.value("entryPoint", nlohmann::json(nullptr));
    body["isTemplate"] = false;
    const auto now = nowEpochMillis();
    body["createdAt"] = now;
    body["updatedAt"] = now;
    body["userId"] = userId;
    body["tenantId"] = dbalTenant();

    const auto r =
        dbalRequest("POST", "/" + dbalTenant() + "/pastebin/Snippet", &body);
    if (!r || !r->ok())
        return {nlohmann::json{{"error", "Failed to fork snippet"}}, 500};
    return {normalizeSnippet(r->body.value("data", nlohmann::json::object())),
            201};
}

} // namespace pastebin
