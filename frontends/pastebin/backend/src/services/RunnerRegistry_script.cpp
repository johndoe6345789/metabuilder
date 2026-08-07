#include "RunnerRegistry_internal.hpp"

namespace pastebin {

void populateScriptRunners(std::map<std::string, RunnerSpec>& m) {
    m["go"] = makeRunnerSpec("GO_RUNNER_IMAGE", "golang:1.22-alpine", false,
                              "", "cd /workspace && go run {entry}",
                              "main.go");

    m["rust"] = makeRunnerSpec(
        "RUST_RUNNER_IMAGE", "rust:1.77-slim", false, "",
        "cd /workspace && rustc {entry} -o /tmp/rustout 2>&1 && "
        "/tmp/rustout",
        "main.rs");

    m["ruby"] = makeRunnerSpec(
        "RUBY_RUNNER_IMAGE", "ruby:3.3-slim", false,
        "cd /workspace && ([ -f Gemfile ] && bundle install -q "
        "2>/dev/null || true)",
        "ruby /workspace/{entry}", "main.rb");

    m["php"] = makeRunnerSpec("PHP_RUNNER_IMAGE", "php:8.3-cli-alpine", false,
                               "", "php /workspace/{entry}", "main.php");

    m["csharp"] = makeRunnerSpec(
        "CSHARP_RUNNER_IMAGE", "mcr.microsoft.com/dotnet/sdk:8.0", false, "",
        "cd /workspace && dotnet run --project . 2>&1", "Program.cs");
}

} // namespace pastebin
