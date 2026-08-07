#include "RunnerRegistry_internal.hpp"

namespace pastebin {

void populateMiscRunners(std::map<std::string, RunnerSpec>& m) {
    m["elixir"] = makeRunnerSpec("ELIXIR_RUNNER_IMAGE", "elixir:1.16-slim",
                                  false, "", "elixir /workspace/{entry}",
                                  "main.exs");

    m["dart"] = makeRunnerSpec("DART_RUNNER_IMAGE", "dart:3.4-sdk", false, "",
                                "dart run /workspace/{entry}", "main.dart");

    m["lua"] = makeRunnerSpec(
        "LUA_RUNNER_IMAGE", "alpine:3.20", false,
        "apk add --no-cache lua5.4 -q 2>/dev/null",
        "lua5.4 /workspace/{entry}", "main.lua");

    m["perl"] = makeRunnerSpec("PERL_RUNNER_IMAGE", "perl:5.40-slim", false,
                                "", "perl /workspace/{entry}", "main.pl");

    m["bash"] = makeRunnerSpec("BASH_RUNNER_IMAGE", "bash:5.2-alpine3.20",
                                false, "", "bash /workspace/{entry}",
                                "script.sh");

    m["typescript"] = makeRunnerSpec(
        "TS_RUNNER_IMAGE", "node:20-slim", false,
        "cd /workspace && npm install -g tsx --silent 2>/dev/null || true",
        "tsx /workspace/{entry}", "index.ts");

    m["swift"] = makeRunnerSpec("SWIFT_RUNNER_IMAGE", "swift:5.10-slim",
                                 false, "", "swift /workspace/{entry}",
                                 "main.swift");
}

} // namespace pastebin
