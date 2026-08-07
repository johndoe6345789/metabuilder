#include "RunCommand.hpp"
#include "../util.hpp"

#include <algorithm>

namespace pastebin {

namespace {

std::string renderRunTemplate(const std::string& runTpl,
                               const std::string& entry) {
    std::string run = runTpl;
    if (const auto pos = run.find("{entry}"); pos != std::string::npos)
        run.replace(pos, 7, entry);
    return run;
}

int defaultTimeoutFor(const RunnerSpec& spec) {
    if (spec.interactive)
        return envInt("PYTHON_RUN_TIMEOUT", envInt("RUN_TIMEOUT", 30));
    return envInt("BUILD_TIMEOUT", 120);
}

} // namespace

std::vector<std::string> buildRunCommand(
    const RunnerSpec& spec, const std::string& entry, bool interactive,
    std::optional<int> userTimeoutSeconds) {
    std::string fullCmd = fileWriterShellSnippet();
    if (!spec.setupTpl.empty())
        fullCmd += " && " + spec.setupTpl;
    fullCmd += " && " + renderRunTemplate(spec.runTpl, entry);

    if (interactive)
        return {"sh", "-c", fullCmd};

    const int maxTimeout = envInt("MAX_RUN_TIMEOUT", 300);
    const int timeout = std::min(
        userTimeoutSeconds.value_or(defaultTimeoutFor(spec)), maxTimeout);
    return {"sh", "-c", R"(exec timeout "$0" sh -c "$1")",
            std::to_string(timeout), fullCmd};
}

} // namespace pastebin
