#include "DebugLaunchArgs.hpp"

namespace pastebin {

namespace {

nlohmann::json pythonLaunchArgs() {
    nlohmann::json mapping;
    mapping["localRoot"] = "/workspace";
    mapping["remoteRoot"] = "/workspace";

    nlohmann::json args;
    args["type"] = "python";
    args["request"] = "attach";
    args["justMyCode"] = false;
    args["redirectOutput"] = true;
    args["pathMappings"] = nlohmann::json::array({mapping});
    return args;
}

nlohmann::json nodeLaunchArgs(const std::string& entry, bool typescript) {
    nlohmann::json args;
    args["type"] = "pwa-node";
    args["request"] = "launch";
    args["program"] = "/workspace/" + entry;
    args["cwd"] = "/workspace";
    if (typescript)
        args["runtimeExecutable"] = "tsx";
    return args;
}

nlohmann::json goLaunchArgs() {
    nlohmann::json args;
    args["request"] = "launch";
    args["mode"] = "debug";
    args["program"] = "/workspace";
    return args;
}

nlohmann::json cppLaunchArgs() {
    nlohmann::json args;
    args["request"] = "launch";
    args["program"] = "/workspace/__prog__";
    args["args"] = nlohmann::json::array();
    args["cwd"] = "/workspace";
    args["stopAtEntry"] = false;
    return args;
}

} // namespace

nlohmann::json buildDebugLaunchArgs(const std::string& language,
                                     const std::string& entry) {
    if (language == "python")
        return pythonLaunchArgs();
    if (language == "javascript")
        return nodeLaunchArgs(entry, false);
    if (language == "typescript")
        return nodeLaunchArgs(entry, true);
    if (language == "go")
        return goLaunchArgs();
    return cppLaunchArgs();
}

} // namespace pastebin
