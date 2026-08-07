#include "ParseRunRequest_cmake.hpp"

#include <algorithm>

namespace pastebin {

namespace {

bool hasCMakeLists(const std::vector<SourceFile>& files) {
    return std::any_of(files.begin(), files.end(), [](const SourceFile& f) {
        return f.name == "CMakeLists.txt";
    });
}

bool endsWithAny(const std::string& s,
                  std::initializer_list<const char*> suffixes) {
    for (const auto* suffix : suffixes) {
        const std::string suf(suffix);
        if (s.size() >= suf.size() &&
            s.compare(s.size() - suf.size(), suf.size(), suf) == 0)
            return true;
    }
    return false;
}

std::string findCppEntry(const std::vector<SourceFile>& files,
                          const std::string& fallback) {
    for (const auto& f : files) {
        if (endsWithAny(f.name, {".cpp", ".cc", ".cxx"}))
            return f.name;
    }
    return fallback;
}

std::string exeNameFor(const std::string& cppEntry) {
    const auto dot = cppEntry.find_last_of('.');
    return dot == std::string::npos ? "app" : cppEntry.substr(0, dot);
}

} // namespace

void injectCMakeListsIfNeeded(ParsedRunRequest& req) {
    if (req.language != "cpp-cmake" || req.files.empty() ||
        hasCMakeLists(req.files)) {
        return;
    }

    const std::string cppEntry = findCppEntry(req.files, req.entryPoint);
    const std::string exeName = exeNameFor(cppEntry);
    const std::string cmake = "cmake_minimum_required(VERSION 3.16)\n"
                               "project(" +
                               exeName +
                               ")\n"
                               "set(CMAKE_CXX_STANDARD 17)\n"
                               "add_executable(" +
                               exeName + " " + cppEntry + ")\n";

    req.files.insert(req.files.begin(), {"CMakeLists.txt", cmake});
    req.entryPoint = exeName;
}

} // namespace pastebin
