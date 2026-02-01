#pragma once
/**
 * Workflow plugin: get variable from store
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::var {

inline PluginResult get(Runtime& runtime, const json& inputs) {
    std::string name = inputs.value("name", "");
    json default_value = inputs.value("default", json{});

    auto it = runtime.store.find(name);
    if (it != runtime.store.end()) {
        return {{"result", it->second}};
    }
    return {{"result", default_value}};
}

} // namespace metabuilder::workflow::var
