#include "OwnContainerId.hpp"

#include <fstream>

namespace pastebin {

namespace {

// /proc/1/cpuset contains /docker/<full-id> when containerised.
std::optional<std::string> readCpusetContainerId() {
    std::ifstream f("/proc/1/cpuset");
    std::string line;
    if (!std::getline(f, line))
        return std::nullopt;

    const std::string marker = "/docker/";
    const auto pos = line.rfind(marker);
    if (pos == std::string::npos)
        return std::nullopt;
    return line.substr(pos + marker.size());
}

std::optional<std::string> readHostname() {
    std::ifstream f("/etc/hostname");
    std::string line;
    if (!std::getline(f, line) || line.empty())
        return std::nullopt;
    return line;
}

} // namespace

std::optional<std::string> ownContainerId() {
    static const std::optional<std::string> cached = [] {
        if (auto id = readCpusetContainerId())
            return id;
        return readHostname();
    }();
    return cached;
}

} // namespace pastebin
