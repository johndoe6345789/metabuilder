#include "RunnerRegistry.hpp"
#include "RunnerRegistry_internal.hpp"
#include "../util.hpp"

#include <map>
#include <utility>

namespace pastebin {

RunnerSpec makeRunnerSpec(std::string imageEnvVar, std::string imageDefault,
                           bool interactive, std::string setupTpl,
                           std::string runTpl, std::string defaultEntry,
                           std::string dockerfilePath) {
    RunnerSpec spec;
    spec.imageEnvVar = std::move(imageEnvVar);
    spec.imageDefault = std::move(imageDefault);
    spec.interactive = interactive;
    spec.setupTpl = std::move(setupTpl);
    spec.runTpl = std::move(runTpl);
    spec.defaultEntry = std::move(defaultEntry);
    spec.dockerfilePath = std::move(dockerfilePath);
    return spec;
}

RunnerSpec makeSqlRunnerSpec(std::string imageEnvVar,
                              std::string imageDefault,
                              std::string sqlRunner,
                              std::string defaultEntry) {
    RunnerSpec spec;
    spec.imageEnvVar = std::move(imageEnvVar);
    spec.imageDefault = std::move(imageDefault);
    spec.defaultEntry = std::move(defaultEntry);
    spec.sqlRunner = std::move(sqlRunner);
    return spec;
}

namespace {

const std::map<std::string, RunnerSpec>& allRunners() {
    static const std::map<std::string, RunnerSpec> table = [] {
        std::map<std::string, RunnerSpec> m;
        populateCoreRunners(m);
        populateScriptRunners(m);
        populateCompiledRunners(m);
        populateMiscRunners(m);
        populateSqlRunners(m);
        return m;
    }();
    return table;
}

} // namespace

std::optional<RunnerSpec> findRunner(const std::string& language) {
    const auto& table = allRunners();
    const auto it = table.find(language);
    if (it == table.end())
        return std::nullopt;
    return it->second;
}

std::string runnerImage(const RunnerSpec& spec) {
    return envOr(spec.imageEnvVar.c_str(), spec.imageDefault);
}

} // namespace pastebin
