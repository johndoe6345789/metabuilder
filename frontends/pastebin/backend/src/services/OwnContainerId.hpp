#pragma once

#include <optional>
#include <string>

namespace pastebin {

/// The backend's own container id, if it's running inside Docker --
/// needed so DebugSession can attach the backend itself to a debug
/// session's isolated network. Cached after the first call.
std::optional<std::string> ownContainerId();

} // namespace pastebin
