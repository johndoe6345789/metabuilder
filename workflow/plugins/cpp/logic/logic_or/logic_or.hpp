#pragma once
/**
 * Workflow plugin: logical OR
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::logic {

inline PluginResult or_op(Runtime&, const json& inputs) {
    auto values = inputs.value("values", std::vector<bool>{});
    bool result = std::any_of(values.begin(), values.end(), [](bool v) { return v; });
    return {{"result", result}};
}

} // namespace metabuilder::workflow::logic
