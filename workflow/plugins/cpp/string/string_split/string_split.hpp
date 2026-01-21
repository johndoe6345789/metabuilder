#pragma once
/**
 * Workflow plugin: split string by separator
 */

#include "../../plugin.hpp"
#include <vector>
#include <sstream>

namespace metabuilder::workflow::string {

inline PluginResult split(Runtime&, const json& inputs) {
    auto text = inputs.value("text", std::string{});
    auto separator = inputs.value("separator", std::string{" "});
    auto max_splits = inputs.contains("max_splits") ? inputs["max_splits"].get<int>() : -1;

    std::vector<std::string> result;

    if (separator.empty()) {
        result.push_back(text);
        return {{"result", result}};
    }

    size_t pos = 0;
    size_t prev = 0;
    int count = 0;

    while ((pos = text.find(separator, prev)) != std::string::npos) {
        if (max_splits >= 0 && count >= max_splits) break;
        result.push_back(text.substr(prev, pos - prev));
        prev = pos + separator.length();
        ++count;
    }
    result.push_back(text.substr(prev));

    return {{"result", result}};
}

} // namespace metabuilder::workflow::string
