#pragma once
/**
 * Workflow plugin: round a number
 */

#include "../../plugin.hpp"
#include <cmath>

namespace metabuilder::workflow::math {

inline PluginResult round(Runtime&, const json& inputs) {
    double value = inputs.value("value", 0.0);
    int decimals = inputs.value("decimals", 0);

    double factor = std::pow(10.0, decimals);
    double result = std::round(value * factor) / factor;
    return {{"result", result}};
}

} // namespace metabuilder::workflow::math
