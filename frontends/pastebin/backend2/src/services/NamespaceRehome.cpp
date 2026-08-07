#include "NamespaceRehome.hpp"
#include "DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

std::string findDefaultNamespaceId(const std::string& userId,
                                    const std::string& excludeId) {
    const auto all = dbalAllPages(
        "/" + dbalTenant() + "/pastebin/Namespace?filter.userId=" + userId);
    for (const auto& ns : all) {
        if (ns.value("isDefault", false) &&
            ns.value("id", std::string()) != excludeId) {
            return ns.value("id", "");
        }
    }
    return "";
}

bool rehomeSnippets(const std::string& namespaceId, const std::string& userId,
                     const std::string& defaultNsId) {
    const auto snippets = dbalAllPages(
        "/" + dbalTenant() + "/pastebin/Snippet?filter.namespaceId=" +
        namespaceId);
    for (auto snippet : snippets) {
        if (snippet.value("userId", "") != userId)
            continue;
        snippet["namespaceId"] = defaultNsId;
        const auto sid = snippet.value("id", "");
        const auto r = dbalRequest(
            "PUT", "/" + dbalTenant() + "/pastebin/Snippet/" + sid, &snippet);
        if (!r || !r->ok())
            return false;
    }
    return true;
}

} // namespace pastebin
