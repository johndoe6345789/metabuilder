#include "DockerEngine.hpp"
#include "DockerRequest.hpp"

#include <nlohmann/json.hpp>

#include <stdexcept>

namespace pastebin {

void dockerStartContainer(const std::string& id) {
    const auto r = dockerRequest("POST", "/containers/" + id + "/start");
    if (r.status != 204 && r.status != 304) {
        throw std::runtime_error("Docker start failed (HTTP " +
                                  std::to_string(r.status) + "): " + r.body);
    }
}

int dockerWaitContainer(const std::string& id, int timeoutSeconds) {
    const auto r = dockerRequest("POST", "/containers/" + id + "/wait",
                                  nullptr, timeoutSeconds);
    if (r.status != 200) {
        throw std::runtime_error("Docker wait failed (HTTP " +
                                  std::to_string(r.status) + "): " + r.body);
    }
    return nlohmann::json::parse(r.body).value("StatusCode", -1);
}

void dockerRemoveContainer(const std::string& id) {
    // Best-effort: a container that already vanished (e.g. daemon-side
    // cleanup) shouldn't fail the caller's own cleanup step.
    dockerRequest("DELETE", "/containers/" + id + "?force=true");
}

} // namespace pastebin
