#include "SnippetRevisions.hpp"
#include "DbalClient.hpp"
#include "Uuid.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

nlohmann::json orNull(const std::string& s) {
    return s.empty() ? nlohmann::json(nullptr) : nlohmann::json(s);
}

bool matchesLastRevision(const nlohmann::json& lastRev,
                          const std::string& code,
                          const std::string& filesJson) {
    return lastRev.value("code", "") == code &&
           lastRev.value("files", nlohmann::json(nullptr)) ==
               orNull(filesJson);
}

std::string revisionListPath(const std::string& snippetId) {
    return "/" + dbalTenant() +
           "/pastebin/SnippetRevision?filter.snippetId=" + snippetId +
           "&sort=-createdAt&limit=1";
}

bool alreadyMatchesLatest(const std::string& snippetId,
                           const std::string& code,
                           const std::string& filesJson) {
    const auto r = dbalRequest("GET", revisionListPath(snippetId));
    if (!r || !r->ok())
        return false;
    const auto items =
        r->body.value("data", r->body).value("data", nlohmann::json::array());
    return !items.empty() &&
           matchesLastRevision(items.front(), code, filesJson);
}

} // namespace

void maybeSaveRevision(const std::string& snippetId, const std::string& code,
                        const std::string& filesJson,
                        const std::string& userId) {
    if (alreadyMatchesLatest(snippetId, code, filesJson))
        return;

    nlohmann::json body;
    body["id"] = generateUuidV4();
    body["snippetId"] = snippetId;
    body["code"] = code;
    body["files"] = orNull(filesJson);
    body["createdAt"] = nowEpochMillis();
    body["userId"] = userId;
    body["tenantId"] = dbalTenant();
    dbalRequest("POST", "/" + dbalTenant() + "/pastebin/SnippetRevision",
                &body);
}

} // namespace pastebin
