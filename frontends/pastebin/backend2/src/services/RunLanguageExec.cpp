#include "RunLanguageExec.hpp"
#include "DockerImage.hpp"
#include "DockerRunToCompletion.hpp"

namespace pastebin {

namespace {

ContainerConfig toContainerConfig(const std::string& image,
                                   const std::vector<std::string>& cmd,
                                   const std::vector<SourceFile>& files) {
    ContainerConfig cfg;
    cfg.image = image;
    cfg.cmd = cmd;
    cfg.env = {makeContainerFilesEnv(files)};
    cfg.workingDir = "/workspace";
    cfg.networkDisabled = true;
    cfg.memLimitBytes = 256LL * 1024 * 1024;
    cfg.nanoCpus = 500'000'000LL;
    cfg.pidsLimit = 256;
    return cfg;
}

} // namespace

RunExecResult runLanguageInDocker(const RunnerSpec& spec,
                                   const std::string& entry,
                                   const std::vector<SourceFile>& files,
                                   std::optional<int> userTimeoutSeconds) {
    const std::string image = runnerImage(spec);
    dockerEnsureImage(image);

    const auto cmd =
        buildRunCommand(spec, entry, /*interactive=*/false, userTimeoutSeconds);
    const int timeout = effectiveTimeoutSeconds(spec, userTimeoutSeconds);

    RunExecResult result;
    result.body = runContainerToCompletion(
        toContainerConfig(image, cmd, files), timeout, &result.status);
    return result;
}

} // namespace pastebin
