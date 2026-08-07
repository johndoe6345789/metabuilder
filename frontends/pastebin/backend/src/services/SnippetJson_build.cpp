#include "SnippetJson.hpp"
#include "TimeCoerce.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

std::string jsonFieldToString(const Json::Value& v) {
    Json::StreamWriterBuilder w;
    w["indentation"] = "";
    return Json::writeString(w, v);
}

nlohmann::json optionalString(const Json::Value& data, const char* field) {
    if (!data.isMember(field) || data[field].isNull())
        return nullptr;
    return data[field].asString();
}

nlohmann::json embeddedJsonField(const Json::Value& data, const char* field) {
    if (!data.isMember(field) || data[field].isNull())
        return nullptr;
    return jsonFieldToString(data[field]);
}

} // namespace

nlohmann::json buildSnippetBody(const Json::Value& data,
                                 const std::string& userId, bool includeId,
                                 bool includeCreated) {
    nlohmann::json body;
    body["title"] = data["title"].asString();
    body["description"] = data.get("description", "").asString();
    body["code"] = data["code"].asString();
    body["language"] = data["language"].asString();
    body["category"] = data.get("category", "general").asString();
    body["namespaceId"] = optionalString(data, "namespaceId");
    body["hasPreview"] = data.get("hasPreview", false).asBool();
    body["functionName"] = optionalString(data, "functionName");
    body["inputParameters"] = embeddedJsonField(data, "inputParameters");
    body["files"] = embeddedJsonField(data, "files");
    body["entryPoint"] = optionalString(data, "entryPoint");
    body["isTemplate"] = data.get("isTemplate", false).asBool();
    body["updatedAt"] = coerceEpochMillis(data["updatedAt"]);
    body["userId"] = userId;
    body["tenantId"] = dbalTenant();
    if (includeId)
        body["id"] = data["id"].asString();
    if (includeCreated)
        body["createdAt"] = coerceEpochMillis(data["createdAt"]);
    return body;
}

} // namespace pastebin
