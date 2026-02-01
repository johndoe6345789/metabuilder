#pragma once
/**
 * Workflow plugin: concatenate strings
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::string {

inline PluginResult concat(Runtime&, const json& inputs) {
    auto strings = inputs.value("strings", std::vector<std::string>{});
    auto separator = inputs.value("separator", std::string{});

    std::string result;
    for (size_t i = 0; i < strings.size(); ++i) {
        if (i > 0) result += separator;
        result += strings[i];
    }
    return {{"result", result}};
}

} // namespace metabuilder::workflow::string
