#include "DebugRunnerRegistry.hpp"
#include "../util.hpp"

#include <map>

namespace pastebin {

namespace {

const std::map<std::string, DebugRunnerSpec>& allDebugRunners() {
    static const std::map<std::string, DebugRunnerSpec> table = {
        {"python", {"PYTHON_DEBUG_IMAGE", "python:3.11-slim",
                    "pip install debugpy -q 2>/dev/null",
                    "python -m debugpy --listen 0.0.0.0:{port} "
                    "--wait-for-client /workspace/{entry}"}},
        {"javascript",
         {"NODE_DEBUG_IMAGE", "node:20-slim", "",
          "node /opt/js-debug/js-debug/src/dapDebugServer.js {port} "
          "0.0.0.0"}},
        {"typescript",
         {"NODE_DEBUG_IMAGE", "node:20-slim", "",
          "node /opt/js-debug/js-debug/src/dapDebugServer.js {port} "
          "0.0.0.0"}},
        {"go", {"GO_DEBUG_IMAGE", "golang:1.22-alpine",
                "go install github.com/go-delve/delve/cmd/dlv@latest "
                "2>/dev/null",
                "$(go env GOPATH)/bin/dlv dap --listen=0.0.0.0:{port} "
                "--headless=true --log=false"}},
        {"cpp-cmake",
         {"CPP_DEBUG_IMAGE", "cpp-debug:latest", "",
          "g++ -g -O0 -o /workspace/__prog__ "
          "$(find /workspace -name '*.cpp' | sort | tr '\\n' ' ') "
          "2>&1 | head -30 && ( /opt/codelldb/extension/adapter/codelldb "
          "--port 15678 --multi-session & sleep 1 && "
          "socat TCP-LISTEN:{port},bind=0.0.0.0,reuseaddr,fork "
          "TCP:127.0.0.1:15678 )"}},
    };
    return table;
}

std::string replaceAll(std::string text, const std::string& from,
                        const std::string& to) {
    size_t pos = 0;
    while ((pos = text.find(from, pos)) != std::string::npos) {
        text.replace(pos, from.size(), to);
        pos += to.size();
    }
    return text;
}

} // namespace

std::optional<DebugRunnerSpec> findDebugRunner(const std::string& language) {
    const auto& table = allDebugRunners();
    const auto it = table.find(language);
    if (it == table.end())
        return std::nullopt;
    return it->second;
}

std::string debugRunnerImage(const DebugRunnerSpec& spec) {
    return envOr(spec.imageEnvVar.c_str(), spec.imageDefault);
}

std::string renderDapCommand(const DebugRunnerSpec& spec, int port,
                              const std::string& entry) {
    return replaceAll(replaceAll(spec.dapCmdTpl, "{port}",
                                  std::to_string(port)),
                       "{entry}", entry);
}

} // namespace pastebin
