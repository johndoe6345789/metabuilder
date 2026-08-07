#include "DockerNetwork.hpp"
#include "DockerRequest.hpp"

#include <nlohmann/json.hpp>

#include <stdexcept>

namespace pastebin {

std::string dockerCreateNetwork(const std::string& name) {
    nlohmann::json body;
    body["Name"] = name;
    body["Driver"] = "bridge";
    body["Internal"] = true;
    const std::string bodyText = body.dump();

    const auto r = dockerRequest("POST", "/networks/create", &bodyText);
    if (r.status != 201) {
        throw std::runtime_error("Docker network create failed (HTTP " +
                                  std::to_string(r.status) + "): " + r.body);
    }
    return nlohmann::json::parse(r.body).value("Id", "");
}

void dockerConnectNetwork(const std::string& networkId,
                           const std::string& containerId) {
    nlohmann::json body;
    body["Container"] = containerId;
    const std::string bodyText = body.dump();
    dockerRequest("POST", "/networks/" + networkId + "/connect", &bodyText);
}

std::vector<std::string> dockerNetworkContainerIds(
    const std::string& networkId) {
    std::vector<std::string> ids;
    const auto r = dockerRequest("GET", "/networks/" + networkId);
    if (r.status != 200)
        return ids;

    const auto parsed = nlohmann::json::parse(r.body);
    if (parsed.contains("Containers") && parsed["Containers"].is_object()) {
        for (const auto& item : parsed["Containers"].items())
            ids.push_back(item.key());
    }
    return ids;
}

void dockerDisconnectNetwork(const std::string& networkId,
                              const std::string& containerId) {
    nlohmann::json body;
    body["Container"] = containerId;
    body["Force"] = true;
    const std::string bodyText = body.dump();
    dockerRequest("POST", "/networks/" + networkId + "/disconnect",
                  &bodyText);
}

void dockerRemoveNetwork(const std::string& networkId) {
    dockerRequest("DELETE", "/networks/" + networkId);
}

} // namespace pastebin
