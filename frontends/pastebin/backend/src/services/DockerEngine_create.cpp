#include "DockerEngine.hpp"
#include "DockerRequest.hpp"

#include <nlohmann/json.hpp>

#include <stdexcept>

namespace pastebin {

namespace {

nlohmann::json buildCreateBody(const ContainerConfig& cfg) {
    nlohmann::json body;
    body["Image"] = cfg.image;
    body["Cmd"] = cfg.cmd;
    body["Env"] = cfg.env;
    body["WorkingDir"] = cfg.workingDir;
    body["NetworkDisabled"] = cfg.networkDisabled;
    body["OpenStdin"] = cfg.openStdin;

    nlohmann::json hostConfig;
    if (cfg.memLimitBytes > 0)
        hostConfig["Memory"] = cfg.memLimitBytes;
    if (cfg.nanoCpus > 0)
        hostConfig["NanoCpus"] = cfg.nanoCpus;
    if (cfg.pidsLimit > 0)
        hostConfig["PidsLimit"] = cfg.pidsLimit;
    if (!cfg.networkName.empty())
        hostConfig["NetworkMode"] = cfg.networkName;
    body["HostConfig"] = hostConfig;
    return body;
}

} // namespace

std::string dockerCreateContainer(const ContainerConfig& cfg) {
    const auto bodyJson = buildCreateBody(cfg);
    const std::string bodyText = bodyJson.dump();
    const auto r = dockerRequest("POST", "/containers/create", &bodyText);
    if (r.status != 201) {
        throw std::runtime_error("Docker create failed (HTTP " +
                                  std::to_string(r.status) + "): " + r.body);
    }
    return nlohmann::json::parse(r.body).value("Id", "");
}

} // namespace pastebin
