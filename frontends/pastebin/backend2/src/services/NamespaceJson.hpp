#pragma once

#include <nlohmann/json.hpp>

namespace pastebin {

/// Coerces a raw DBAL Namespace record's isDefault field to a real bool.
nlohmann::json normalizeNamespace(nlohmann::json data);

} // namespace pastebin
