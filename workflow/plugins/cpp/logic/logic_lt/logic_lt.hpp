#pragma once
/**
 * Workflow plugin: less than comparison
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::logic {

inline PluginResult lt(Runtime&, const json& inputs) {
    auto a = inputs.value("a", json{});
    auto b = inputs.value("b", json{});

    if (a.is_number() && b.is_number()) {
        return {{"result", a.get<double>() < b.get<double>()}};
    }

    if (a.is_string() && b.is_string()) {
        return {{"result", a.get<std::string>() < b.get<std::string>()}};
    }

    return {{"result", false}};
}

} // namespace metabuilder::workflow::logic
