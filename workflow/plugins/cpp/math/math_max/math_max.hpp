#pragma once
/**
 * Workflow plugin: maximum of numbers
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::math {

inline PluginResult max(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    if (numbers.empty()) {
        return {{"result", 0}, {"error", "numbers must be non-empty"}};
    }
    return {{"result", *std::max_element(numbers.begin(), numbers.end())}};
}

} // namespace metabuilder::workflow::math
