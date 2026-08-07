#include "RunFiles.hpp"

#include <map>

namespace pastebin {

namespace {

bool isSafeChar(char c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
           (c >= '0' && c <= '9') || c == '.' || c == '_' || c == '-';
}

std::string basename(const std::string& path) {
    const auto slash = path.find_last_of("/\\");
    return slash == std::string::npos ? path : path.substr(slash + 1);
}

std::string sanitizeName(const std::string& rawName) {
    std::string safe;
    for (char c : basename(rawName))
        safe += isSafeChar(c) ? c : '_';
    if (safe.size() > 128)
        safe.resize(128);
    return safe.empty() ? "file" : safe;
}

std::string stemOf(const std::string& name) {
    const auto dot = name.find_last_of('.');
    return dot == std::string::npos ? name : name.substr(0, dot);
}

} // namespace

SanitizedFiles sanitizeFilesAndEntry(const std::vector<SourceFile>& files,
                                      const std::string& entryPoint) {
    SanitizedFiles result;
    std::map<std::string, std::string> nameMap;
    std::map<std::string, std::string> stemMap;

    for (const auto& f : files) {
        const std::string safe = sanitizeName(f.name);
        nameMap[f.name] = safe;
        stemMap.emplace(stemOf(safe), safe);
        result.files.push_back({safe, f.content});
    }

    if (const auto it = nameMap.find(entryPoint); it != nameMap.end()) {
        result.entryPoint = it->second;
    } else if (const auto sit = stemMap.find(entryPoint);
               sit != stemMap.end()) {
        result.entryPoint = sit->second;
    } else if (!result.files.empty()) {
        result.entryPoint = result.files.front().name;
    } else {
        result.entryPoint = entryPoint;
    }
    return result;
}

} // namespace pastebin
