#pragma once
/**
 * Workflow plugin: replace occurrences in string
 */

#include "../../plugin.hpp"

namespace metabuilder::workflow::string {

inline PluginResult replace(Runtime&, const json& inputs) {
    auto text = inputs.value("text", std::string{});
    auto old_str = inputs.value("old", std::string{});
    auto new_str = inputs.value("new", std::string{});
    auto count = inputs.contains("count") ? inputs["count"].get<int>() : -1;

    if (old_str.empty()) {
        return {{"result", text}};
    }

    std::string result = text;
    size_t pos = 0;
    int replaced = 0;

    while ((pos = result.find(old_str, pos)) != std::string::npos) {
        if (count >= 0 && replaced >= count) break;
        result.replace(pos, old_str.length(), new_str);
        pos += new_str.length();
        ++replaced;
    }

    return {{"result", result}};
}

} // namespace metabuilder::workflow::string
