#pragma once
/**
 * Workflow plugin: check if variable exists in store
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::var {

inline PluginResult exists(Runtime& runtime, const json& inputs) {
    std::string key = inputs.value("key", "");

    if (key.empty()) {
        return {{"result", false}, {"error", "key is required"}};
    }

    bool found = runtime.store.find(key) != runtime.store.end();
    return {{"result", found}};
}

} // namespace metabuilder::workflow::var
