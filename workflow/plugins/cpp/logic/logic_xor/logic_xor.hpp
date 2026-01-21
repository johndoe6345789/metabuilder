#pragma once
/**
 * Workflow plugin: logical XOR
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::logic {

inline PluginResult xor_op(Runtime&, const json& inputs) {
    bool a = inputs.value("a", false);
    bool b = inputs.value("b", false);
    return {{"result", a != b}};
}

} // namespace metabuilder::workflow::logic
