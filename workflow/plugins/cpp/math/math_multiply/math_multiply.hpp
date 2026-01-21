#pragma once
/**
 * Workflow plugin: multiply numbers
 */

#include "../../plugin.hpp"
#include <numeric>

namespace metabuilder::workflow::math {

inline PluginResult multiply(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    if (numbers.empty()) {
        return {{"result", 0}};
    }

    double result = std::accumulate(numbers.begin(), numbers.end(), 1.0,
                                    std::multiplies<double>());
    return {{"result", result}};
}

} // namespace metabuilder::workflow::math
