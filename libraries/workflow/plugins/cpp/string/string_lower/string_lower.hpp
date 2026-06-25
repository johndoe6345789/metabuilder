#pragma once
/**
 * Workflow plugin: convert to lowercase
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::string {

inline PluginResult lower(Runtime&, const json& inputs) {
    auto str = inputs.value("string", std::string{});
    std::transform(str.begin(), str.end(), str.begin(), ::tolower);
    return {{"result", str}};
}

} // namespace metabuilder::workflow::string
