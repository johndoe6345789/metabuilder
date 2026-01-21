#pragma once
/**
 * Workflow plugin: equality comparison
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::logic {

inline PluginResult equals(Runtime&, const json& inputs) {
    auto a = inputs.value("a", json{});
    auto b = inputs.value("b", json{});
    return {{"result", a == b}};
}

} // namespace metabuilder::workflow::logic
