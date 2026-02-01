#pragma once
/**
 * Workflow plugin: membership test
 */

#include "../../plugin.hpp"
#include <algorithm>

namespace metabuilder::workflow::logic {

inline PluginResult in(Runtime&, const json& inputs) {
    auto value = inputs.value("value", json{});
    auto collection = inputs.value("collection", json::array());

    if (!collection.is_array()) {
        return {{"result", false}};
    }

    for (const auto& item : collection) {
        if (item == value) {
            return {{"result", true}};
        }
    }

    return {{"result", false}};
}

} // namespace metabuilder::workflow::logic
