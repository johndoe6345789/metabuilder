#include "SqlRunner.hpp"
#include "DockerEngine.hpp"
#include "DockerImage.hpp"
#include "SqlRunner_command.hpp"
#include "../util.hpp"

#include <jwt-cpp/base.h>

namespace pastebin {

namespace {

ContainerConfig toContainerConfig(const std::string& image,
                                   const SqlCommand& command) {
    ContainerConfig cfg;
    cfg.image = image;
    cfg.cmd = command.cmd;
    cfg.env = command.env;
    cfg.networkDisabled = command.networkDisabled;
    cfg.memLimitBytes = 512LL * 1024 * 1024;
    cfg.nanoCpus = 1'000'000'000LL;
    cfg.pidsLimit = 200;
    return cfg;
}

Json::Value runToCompletion(const ContainerConfig& cfg, int timeoutS,
                             int* outStatus) {
    Json::Value out;
    std::string containerId;
    try {
        containerId = dockerCreateContainer(cfg);
        dockerStartContainer(containerId);
        const int exitCode =
            dockerWaitContainer(containerId, timeoutS + 10);
        const auto logs = dockerGetLogs(containerId);
        out["output"] = logs.stdoutText;
        if (exitCode == 124) {
            out["error"] = "Timed out after " + std::to_string(timeoutS) + "s";
            *outStatus = 408;
        } else {
            out["error"] =
                exitCode != 0 ? Json::Value(logs.stderrText) : Json::Value();
        }
    } catch (const std::exception& e) {
        out["error"] = e.what();
        *outStatus = 500;
    }
    if (!containerId.empty()) {
        try {
            dockerRemoveContainer(containerId);
        } catch (...) {
            // Best-effort cleanup; the run's own result is what matters.
        }
    }
    return out;
}

} // namespace

SqlRunResult runSqlInDocker(const RunnerSpec& spec,
                             const std::vector<SourceFile>& files) {
    const std::string sqlContent = files.empty() ? "" : files.front().content;
    const std::string sqlBase64 =
        jwt::base::encode<jwt::alphabet::base64>(sqlContent);

    const auto command = buildSqlCommand(spec, sqlBase64);
    if (!command) {
        SqlRunResult err;
        err.body["error"] = "Unknown SQL backend: " + spec.sqlRunner;
        err.status = 400;
        return err;
    }

    const std::string image = runnerImage(spec);
    dockerEnsureImage(image);

    SqlRunResult result;
    result.body = runToCompletion(toContainerConfig(image, *command),
                                   envInt("SQL_RUN_TIMEOUT", 120),
                                   &result.status);
    return result;
}

} // namespace pastebin
