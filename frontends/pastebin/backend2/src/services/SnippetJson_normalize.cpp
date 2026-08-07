#include "SnippetJson.hpp"

namespace pastebin {

namespace {

void parseEmbeddedJson(nlohmann::json& data, const char* field) {
    if (!data.contains(field) || !data[field].is_string())
        return;
    const auto text = data[field].get<std::string>();
    if (text.empty())
        return;
    try {
        data[field] = nlohmann::json::parse(text);
    } catch (const std::exception&) {
        data[field] = nullptr;
    }
}

} // namespace

nlohmann::json normalizeSnippet(nlohmann::json data) {
    parseEmbeddedJson(data, "inputParameters");
    parseEmbeddedJson(data, "files");
    data["hasPreview"] = data.value("hasPreview", false);
    data["isTemplate"] = data.value("isTemplate", false);
    return data;
}

} // namespace pastebin
