#pragma once
/**
 * Workflow plugin: absolute value
 */

#include "../../plugin.hpp"
#include <cmath>

namespace metabuilder::workflow::math {

inline PluginResult abs(Runtime&, const json& inputs) {
    double value = inputs.value("value", 0.0);
    return {{"result", std::abs(value)}};
}

} // namespace metabuilder::workflow::math
