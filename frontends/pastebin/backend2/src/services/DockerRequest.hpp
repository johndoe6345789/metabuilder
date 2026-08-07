#pragma once

#include <string>

namespace pastebin {

struct DockerHttpResponse {
    long status = 0;
    std::string body;
};

/// Performs one HTTP request against the Docker Engine API over its Unix
/// socket (default /var/run/docker.sock, overridable via DOCKER_SOCKET).
/// `jsonBody` is sent as the request body when non-null. `timeoutSeconds`
/// of 0 means no timeout (needed for long-blocking calls like
/// /containers/{id}/wait). Throws std::runtime_error on a transport-level
/// failure (not on HTTP error status -- callers check `.status`
/// themselves).
DockerHttpResponse dockerRequest(const std::string& method,
                                  const std::string& path,
                                  const std::string* jsonBody = nullptr,
                                  long timeoutSeconds = 30);

} // namespace pastebin
