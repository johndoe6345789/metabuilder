#include "DockerClient.hpp"
#include "DockerHttp.hpp"
#include "DockerJson.hpp"
#include "../util.hpp"

#include <stdexcept>

namespace dockerterminal {

RunResult DockerClient::runInContainer(const std::string& containerId,
                                        const std::string& shellLine) {
    auto argv = splitCommand(shellLine.empty() ? "/bin/sh" : shellLine);
    if (argv.empty())
        argv.push_back("/bin/sh");

    Json::Value createBody;
    createBody["AttachStdout"] = true;
    createBody["AttachStderr"] = true;
    createBody["AttachStdin"] = true;
    createBody["Tty"] = true;
    Json::Value cmd(Json::arrayValue);
    for (const auto& a : argv)
        cmd.append(a);
    createBody["Cmd"] = cmd;

    const std::string createBodyText = jsonText(createBody);
    const std::string createResp = dockerRequest(
        socketPath_, "/containers/" + containerId + "/exec", &createBodyText);
    const std::string execId = parseJson(createResp).get("Id", "").asString();
    if (execId.empty())
        throw std::runtime_error("Docker exec create returned no Id");

    Json::Value startBody;
    startBody["Detach"] = false;
    startBody["Tty"] = true;
    const std::string startBodyText = jsonText(startBody);
    const std::string output = dockerRequest(
        socketPath_, "/exec/" + execId + "/start", &startBodyText);

    const std::string inspectResp =
        dockerRequest(socketPath_, "/exec/" + execId + "/json");
    const Json::Value inspect = parseJson(inspectResp);

    RunResult result;
    result.output = output;
    result.exitCode = inspect.get("ExitCode", 0).asInt();
    return result;
}

} // namespace dockerterminal
