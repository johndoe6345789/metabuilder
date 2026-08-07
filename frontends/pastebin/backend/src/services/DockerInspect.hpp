#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// Inspects `containerId` and returns its IP address on `networkName`,
/// or nullopt if it isn't attached to that network (yet -- callers
/// retry immediately after start()/connect()).
std::optional<std::string> dockerContainerNetworkIp(
    const std::string& containerId, const std::string& networkName);

} // namespace pastebin
