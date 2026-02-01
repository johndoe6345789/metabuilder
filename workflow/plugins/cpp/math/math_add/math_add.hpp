#pragma once
/**
 * Workflow plugin: add numbers
 */

#include "../../plugin.hpp"
#include <numeric>

namespace metabuilder::workflow::math {

inline PluginResult add(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    double sum = std::accumulate(numbers.begin(), numbers.end(), 0.0);
    return {{"result", sum}};
}

} // namespace metabuilder::workflow::math
