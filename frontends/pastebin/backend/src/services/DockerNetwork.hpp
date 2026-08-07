#pragma once

#include <string>
#include <vector>

namespace pastebin {

/// Creates an isolated bridge network (Internal=true -- no NAT, so
/// containers on it can't reach the internet) and returns its id.
std::string dockerCreateNetwork(const std::string& name);

/// Best-effort: attaches `containerId` to `networkId`.
void dockerConnectNetwork(const std::string& networkId,
                           const std::string& containerId);

/// Every container id currently attached to `networkId`.
std::vector<std::string> dockerNetworkContainerIds(
    const std::string& networkId);

/// Best-effort: detaches `containerId` from `networkId`.
void dockerDisconnectNetwork(const std::string& networkId,
                              const std::string& containerId);

/// Best-effort: a network can only be removed once every endpoint has
/// been disconnected (see dockerNetworkContainerIds).
void dockerRemoveNetwork(const std::string& networkId);

} // namespace pastebin
