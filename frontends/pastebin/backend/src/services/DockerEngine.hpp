#pragma once

#include "DockerDemux.hpp"

#include <cstdint>
#include <string>
#include <vector>

namespace pastebin {

struct ContainerConfig {
    std::string image;
    std::vector<std::string> cmd;
    std::vector<std::string> env; // "KEY=VALUE" entries
    std::string workingDir;
    bool networkDisabled = false;
    bool openStdin = false; // keep stdin open for an interactive attach
    std::string networkName; // non-empty attaches to this network instead
                              // of the default bridge (see DockerNetwork.hpp)
    int64_t memLimitBytes = 0; // 0 = daemon default
    int64_t nanoCpus = 0;      // 0 = daemon default
    int pidsLimit = 0;         // 0 = daemon default
};

/// Creates a container (not yet started) and returns its id. Throws on
/// failure.
std::string dockerCreateContainer(const ContainerConfig& cfg);

void dockerStartContainer(const std::string& id);

/// Blocks until the container exits, returning its real exit status
/// (124 if the run script's own internal `timeout` wrapper killed it --
/// see RunCommand.cpp). `timeoutSeconds` is only an HTTP-client safety
/// margin in case Docker itself hangs; a genuine client-side timeout
/// throws, since that indicates a daemon-level problem, not a normal
/// user-code timeout.
int dockerWaitContainer(const std::string& id, int timeoutSeconds);

/// Fetches and demuxes the container's full stdout/stderr log.
DemuxedStreams dockerGetLogs(const std::string& id);

void dockerRemoveContainer(const std::string& id);

} // namespace pastebin
