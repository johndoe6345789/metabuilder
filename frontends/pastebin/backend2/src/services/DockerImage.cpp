#include "DockerImage.hpp"
#include "DockerRequest.hpp"

#include <stdexcept>

namespace pastebin {

bool dockerImageExists(const std::string& image) {
    const auto r = dockerRequest("GET", "/images/" + image + "/json");
    return r.status == 200;
}

void dockerPullImage(const std::string& image) {
    const auto r = dockerRequest("POST", "/images/create?fromImage=" + image,
                                  nullptr, 300);
    if (r.status != 200) {
        throw std::runtime_error("Docker pull failed for '" + image +
                                  "' (HTTP " + std::to_string(r.status) +
                                  "): " + r.body);
    }
}

void dockerEnsureImage(const std::string& image) {
    if (!dockerImageExists(image))
        dockerPullImage(image);
}

} // namespace pastebin
