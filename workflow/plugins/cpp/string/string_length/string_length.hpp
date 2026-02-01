#pragma once
/**
 * Workflow plugin: get string length
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::string {

inline PluginResult length(Runtime&, const json& inputs) {
    auto str = inputs.value("string", std::string{});
    return {{"result", str.length()}};
}

} // namespace metabuilder::workflow::string
