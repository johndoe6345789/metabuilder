#pragma once
/**
 * Workflow plugin: minimum of numbers
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::math {

inline PluginResult min(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    if (numbers.empty()) {
        return {{"result", 0}, {"error", "numbers must be non-empty"}};
    }
    return {{"result", *std::min_element(numbers.begin(), numbers.end())}};
}

} // namespace metabuilder::workflow::math
