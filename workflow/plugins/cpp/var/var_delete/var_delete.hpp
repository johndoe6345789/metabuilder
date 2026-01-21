#pragma once
/**
 * Workflow plugin: delete variable from store
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::var {

inline PluginResult del(Runtime& runtime, const json& inputs) {
    std::string name = inputs.value("name", "");

    auto it = runtime.store.find(name);
    bool existed = (it != runtime.store.end());

    if (existed) {
        runtime.store.erase(it);
    }

    return {{"success", true}, {"existed", existed}};
}

} // namespace metabuilder::workflow::var
