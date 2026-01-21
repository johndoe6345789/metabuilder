#pragma once
/**
 * Workflow plugin: divide numbers
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::math {

inline PluginResult divide(Runtime&, const json& inputs) {
    auto numbers = inputs.value("numbers", std::vector<double>{});
    if (numbers.size() < 2) {
        return {{"result", 0}, {"error", "need at least 2 numbers"}};
    }

    double result = numbers[0];
    for (size_t i = 1; i < numbers.size(); ++i) {
        if (numbers[i] == 0.0) {
            return {{"result", 0}, {"error", "division by zero"}};
        }
        result /= numbers[i];
    }
    return {{"result", result}};
}

} // namespace metabuilder::workflow::math
