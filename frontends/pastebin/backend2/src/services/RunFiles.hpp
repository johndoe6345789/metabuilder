#pragma once

#include <string>
#include <vector>

namespace pastebin {

struct SourceFile {
    std::string name;
    std::string content;
};

struct SanitizedFiles {
    std::vector<SourceFile> files;
    std::string entryPoint;
};

/// Sanitizes file names (path-traversal defence: strips path components,
/// keeps only [a-zA-Z0-9._-], truncates to 128 chars) and resolves
/// `entryPoint` against the sanitized names via: exact match -> stem
/// match -> first file fallback. Pure defence-in-depth -- the frontend
/// already assigns UUID names before sending.
SanitizedFiles sanitizeFilesAndEntry(const std::vector<SourceFile>& files,
                                      const std::string& entryPoint);

} // namespace pastebin
