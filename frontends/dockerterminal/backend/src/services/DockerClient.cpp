#include "DockerClient.hpp"
#include "DockerHttp.hpp"
#include "DockerJson.hpp"

namespace dockerterminal {

DockerClient::DockerClient(std::string socketPath)
    : socketPath_(std::move(socketPath)) {}

std::vector<ContainerInfo> DockerClient::listContainers() {
    const auto body = dockerRequest(socketPath_, "/containers/json?all=true");
    const Json::Value arr = parseJson(body);

    std::vector<ContainerInfo> out;
    for (const auto& item : arr) {
        ContainerInfo c;
        const std::string fullId = item.get("Id", "").asString();
        c.id = fullId.substr(0, 12);

        const auto names = item["Names"];
        if (names.isArray() && !names.empty()) {
            const std::string n = names[0].asString();
            c.name = (!n.empty() && n[0] == '/') ? n.substr(1) : n;
        }

        const std::string image = item.get("Image", "unknown").asString();
        // Untagged images show up as a raw digest here; the old Flask
        // handler's `image.tags[0] if tags else 'unknown'` had the same
        // fallback for this case.
        c.image = image.rfind("sha256:", 0) == 0 ? "unknown" : image;

        c.status = item.get("State", "").asString();
        c.createdEpochSeconds = item.get("Created", 0).asInt64();
        out.push_back(std::move(c));
    }
    return out;
}

} // namespace dockerterminal
