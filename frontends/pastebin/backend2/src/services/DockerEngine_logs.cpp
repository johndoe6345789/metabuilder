#include "DockerEngine.hpp"
#include "DockerRequest.hpp"

namespace pastebin {

DemuxedStreams dockerGetLogs(const std::string& id) {
    const auto r = dockerRequest(
        "GET", "/containers/" + id + "/logs?stdout=true&stderr=true");
    return demuxDockerStream(r.body);
}

} // namespace pastebin
