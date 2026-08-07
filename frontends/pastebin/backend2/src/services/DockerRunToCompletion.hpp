#pragma once

#include "DockerEngine.hpp"

#include <json/json.h>

namespace pastebin {

/// Creates, starts, waits for, and removes a container (best-effort
/// cleanup even on failure), translating the result into {output, error}
/// fields matching the old Flask API. Leaves *outStatus at its initial
/// value (caller should default it to 200) unless the run's own internal
/// `timeout` wrapper killed it (exit 124 -> 408) or Docker itself failed
/// (-> 500). Shared by both the one-shot language runners and the SQL
/// runners, which both follow this exact create/start/wait/logs/remove
/// shape.
Json::Value runContainerToCompletion(const ContainerConfig& cfg,
                                      int timeoutSeconds, int* outStatus);

} // namespace pastebin
