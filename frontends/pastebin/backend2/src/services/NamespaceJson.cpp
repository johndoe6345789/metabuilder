#include "NamespaceJson.hpp"

namespace pastebin {

nlohmann::json normalizeNamespace(nlohmann::json data) {
    data["isDefault"] = data.value("isDefault", false);
    return data;
}

} // namespace pastebin
