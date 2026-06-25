#pragma once
/**
 * Workflow plugin: subtract numbers
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::math {

inline PluginResult subtract(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    if (numbers.empty()) {
        return {{"result", 0}, {"error", "numbers must be non-empty"}};
    }

    double result = numbers[0];
    for (size_t i = 1; i < numbers.size(); ++i) {
        result -= numbers[i];
    }
    return {{"result", result}};
}

} // namespace metabuilder::workflow::math
