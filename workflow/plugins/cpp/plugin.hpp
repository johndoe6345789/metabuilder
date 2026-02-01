#pragma once
/**
 * MetaBuilder Workflow Plugins - C++ Header-Only Library
 *
 * All plugins are header-only for maximum portability.
 * Each plugin follows: PluginResult run(Runtime&, const json&)
 */

#ifndef METABUILDER_WORKFLOW_PLUGIN_HPP
#define METABUILDER_WORKFLOW_PLUGIN_HPP

#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>
#include <functional>

namespace metabuilder::workflow {

using json = nlohmann::json;

struct Runtime {
    std::unordered_map<std::string, json> store;
    std::unordered_map<std::string, json> context;
};

using PluginResult = json;
using PluginFunc = std::function<PluginResult(Runtime&, const json&)>;

} // namespace metabuilder::workflow

#endif // METABUILDER_WORKFLOW_PLUGIN_HPP
