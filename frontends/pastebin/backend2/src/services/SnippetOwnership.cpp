#include "SnippetOwnership.hpp"
#include "DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

std::optional<nlohmann::json> getOwnedSnippet(const std::string& id,
                                               const std::string& userId) {
    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/pastebin/Snippet/" + id);
    if (!r || !r->ok())
        return std::nullopt;
    const auto snippet = r->body.value("data", r->body);
    if (snippet.value("userId", "") != userId)
        return std::nullopt;
    return snippet;
}

} // namespace pastebin
