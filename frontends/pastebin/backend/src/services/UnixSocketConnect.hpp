#pragma once

#include <string>

namespace pastebin {

/// Opens a raw AF_UNIX SOCK_STREAM connection to `socketPath`. Throws
/// std::runtime_error on failure. Caller owns the returned fd (close()
/// it, or use RAII -- see FdGuard in the same header group).
int connectUnixSocket(const std::string& socketPath);

} // namespace pastebin
