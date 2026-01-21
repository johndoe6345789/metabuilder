#pragma once
/**
 * Workflow plugin: trim whitespace from string
 */

#include "../../plugin.hpp"
#include <algorithm>
#include <cctype>

namespace metabuilder::workflow::string {

inline PluginResult trim(Runtime&, const json& inputs) {
    auto text = inputs.value("text", std::string{});
    auto mode = inputs.value("mode", std::string{"both"});

    auto ltrim = [](std::string& s) {
        s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
            return !std::isspace(ch);
        }));
    };

    auto rtrim = [](std::string& s) {
        s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
            return !std::isspace(ch);
        }).base(), s.end());
    };

    std::string result = text;

    if (mode == "start") {
        ltrim(result);
    } else if (mode == "end") {
        rtrim(result);
    } else {
        ltrim(result);
        rtrim(result);
    }

    return {{"result", result}};
}

} // namespace metabuilder::workflow::string
