#include "NamespaceOwnership.hpp"
#include "DbalClient.hpp"
#include "../util.hpp"

namespace pastebin {

std::optional<nlohmann::json> getOwnedNamespace(const std::string& id,
                                                 const std::string& userId) {
    const auto r =
        dbalRequest("GET", "/" + dbalTenant() + "/pastebin/Namespace/" + id);
    if (!r || !r->ok())
        return std::nullopt;
    const auto ns = r->body.value("data", r->body);
    if (ns.value("userId", "") != userId)
        return std::nullopt;
    return ns;
}

} // namespace pastebin
