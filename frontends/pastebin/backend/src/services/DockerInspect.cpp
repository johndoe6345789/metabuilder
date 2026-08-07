#include "DockerInspect.hpp"
#include "DockerRequest.hpp"

#include <nlohmann/json.hpp>

namespace pastebin {

std::optional<std::string> dockerContainerNetworkIp(
    const std::string& containerId, const std::string& networkName) {
    const auto r =
        dockerRequest("GET", "/containers/" + containerId + "/json");
    if (r.status != 200)
        return std::nullopt;

    const auto parsed = nlohmann::json::parse(r.body);
    const auto& networks = parsed["NetworkSettings"]["Networks"];
    if (!networks.contains(networkName))
        return std::nullopt;

    const std::string ip = networks[networkName].value("IPAddress", "");
    if (ip.empty())
        return std::nullopt;
    return ip;
}

} // namespace pastebin
