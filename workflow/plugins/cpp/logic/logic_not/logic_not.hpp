#pragma once
/**
 * Workflow plugin: logical NOT
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::logic {

inline PluginResult not_op(Runtime&, const json& inputs) {
    bool value = inputs.value("value", false);
    return {{"result", !value}};
}

} // namespace metabuilder::workflow::logic
