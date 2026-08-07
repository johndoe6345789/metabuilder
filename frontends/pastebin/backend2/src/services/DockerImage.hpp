#pragma once

#include <string>

namespace pastebin {

bool dockerImageExists(const std::string& image);
void dockerPullImage(const std::string& image);

/// Pulls `image` if it isn't already present locally. Note: unlike the
/// old Flask service, this does not build a custom image from a local
/// Dockerfile (e.g. the cpp-cmake runner's runners/Dockerfile.cpp) --
/// building requires POSTing a tar archive to the Engine API, which
/// wasn't worth the added complexity for this one runner. If a runner's
/// image isn't pullable from a registry, pre-build and push it, or build
/// it once by hand on the Docker host.
void dockerEnsureImage(const std::string& image);

} // namespace pastebin
