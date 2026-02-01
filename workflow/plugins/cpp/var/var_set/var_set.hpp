#pragma once
/**
 * Workflow plugin: set variable in store
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::var {

inline PluginResult set(Runtime& runtime, const json& inputs) {
    std::string name = inputs.value("name", "");
    json value = inputs.value("value", json{});

    runtime.store[name] = value;
    return {{"success", true}, {"name", name}};
}

} // namespace metabuilder::workflow::var
