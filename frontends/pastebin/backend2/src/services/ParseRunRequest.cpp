#include "ParseRunRequest.hpp"
#include "ParseRunRequest_cmake.hpp"
#include "ParseRunRequest_extract.hpp"

namespace pastebin {

ParsedRunRequest parseRunRequest(const Json::Value& data) {
    ParsedRunRequest req = extractRunFields(data);
    injectCMakeListsIfNeeded(req);

    if (req.entryPoint.empty())
        req.entryPoint = "main.py";

    const auto sanitized = sanitizeFilesAndEntry(req.files, req.entryPoint);
    req.files = sanitized.files;
    req.entryPoint = sanitized.entryPoint;
    return req;
}

} // namespace pastebin
