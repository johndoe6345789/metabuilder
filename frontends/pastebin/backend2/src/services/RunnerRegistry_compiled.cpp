#include "RunnerRegistry_internal.hpp"

namespace pastebin {

void populateCompiledRunners(std::map<std::string, RunnerSpec>& m) {
    m["kotlin"] = makeRunnerSpec(
        "KOTLIN_RUNNER_IMAGE", "zenika/kotlin:2.0.0-jdk21", false, "",
        "cd /workspace && kotlinc {entry} -include-runtime -d /tmp/out.jar "
        "2>/dev/null && java -jar /tmp/out.jar",
        "main.kt");

    m["scala"] = makeRunnerSpec(
        "SCALA_RUNNER_IMAGE",
        "sbtscala/scala-sbt:eclipse-temurin-21.0.2_13_1.10.0_3.4.1", false,
        "", "cd /workspace && scala {entry}", "main.scala");

    m["haskell"] = makeRunnerSpec("HASKELL_RUNNER_IMAGE", "haskell:9.8",
                                   false, "", "runghc /workspace/{entry}",
                                   "main.hs");

    m["r"] = makeRunnerSpec("R_RUNNER_IMAGE", "r-base:4.4.1", false, "",
                             "Rscript /workspace/{entry}", "main.R");

    m["julia"] = makeRunnerSpec("JULIA_RUNNER_IMAGE",
                                 "julia:1.10-alpine3.19", false, "",
                                 "julia /workspace/{entry}", "main.jl");
}

} // namespace pastebin
