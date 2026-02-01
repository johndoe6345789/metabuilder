#pragma once
/**
 * Workflow plugin: logical AND
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::logic {

inline PluginResult and_op(Runtime&, const json& inputs) {
    auto values = inputs.value("values", std::vector<bool>{});
    bool result = std::all_of(values.begin(), values.end(), [](bool v) { return v; });
    return {{"result", result}};
}

} // namespace metabuilder::workflow::logic
