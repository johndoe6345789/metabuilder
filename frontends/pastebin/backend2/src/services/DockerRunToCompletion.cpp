#include "DockerRunToCompletion.hpp"

namespace pastebin {

namespace {

void removeBestEffort(const std::string& containerId) {
    if (containerId.empty())
        return;
    try {
        dockerRemoveContainer(containerId);
    } catch (...) {
        // Best-effort cleanup; the run's own result is what matters.
    }
}

} // namespace

Json::Value runContainerToCompletion(const ContainerConfig& cfg,
                                      int timeoutSeconds, int* outStatus) {
    Json::Value out;
    std::string containerId;
    try {
        containerId = dockerCreateContainer(cfg);
        dockerStartContainer(containerId);
        const int exitCode =
            dockerWaitContainer(containerId, timeoutSeconds + 10);
        const auto logs = dockerGetLogs(containerId);
        out["output"] = logs.stdoutText;
        if (exitCode == 124) {
            out["error"] = "Timed out after " +
                            std::to_string(timeoutSeconds) + "s";
            *outStatus = 408;
        } else {
            out["error"] =
                exitCode != 0 ? Json::Value(logs.stderrText) : Json::Value();
        }
    } catch (const std::exception& e) {
        out["error"] = e.what();
        *outStatus = 500;
    }
    removeBestEffort(containerId);
    return out;
}

} // namespace pastebin
