#pragma once
/**
 * Workflow plugin: convert to uppercase
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::string {

inline PluginResult upper(Runtime&, const json& inputs) {
    auto str = inputs.value("string", std::string{});
    std::transform(str.begin(), str.end(), str.begin(), ::toupper);
    return {{"result", str}};
}

} // namespace metabuilder::workflow::string
