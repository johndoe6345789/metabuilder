#include "ParseRunRequest_extract.hpp"
#include "RunnerRegistry.hpp"

#include <algorithm>
#include <cctype>

namespace pastebin {

namespace {

std::string lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(),
                    [](unsigned char c) { return std::tolower(c); });
    return s;
}

std::string defaultEntryFor(const std::string& language) {
    const auto spec = findRunner(language);
    return spec ? spec->defaultEntry : "main.py";
}

std::vector<SourceFile> filesFromJson(const Json::Value& arr) {
    std::vector<SourceFile> out;
    for (const auto& f : arr)
        out.push_back({f.get("name", "").asString(),
                        f.get("content", "").asString()});
    return out;
}

} // namespace

ParsedRunRequest extractRunFields(const Json::Value& data) {
    ParsedRunRequest req;
    const std::string language = data.get("language", "python").asString();
    req.language = lower(language.empty() ? "python" : language);
    if (data.isMember("files"))
        req.files = filesFromJson(data["files"]);
    req.entryPoint = data.get("entryPoint", "").asString();

    if (req.files.empty()) {
        std::string code = data.get("code", "").asString();
        if (!code.empty()) {
            const std::string entry = defaultEntryFor(req.language);
            req.files.push_back({entry, code});
            if (req.entryPoint.empty())
                req.entryPoint = entry;
        }
    }

    if (req.entryPoint.empty() && !req.files.empty())
        req.entryPoint = defaultEntryFor(req.language);

    return req;
}

} // namespace pastebin
