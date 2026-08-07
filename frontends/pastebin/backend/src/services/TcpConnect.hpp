#pragma once

#include <string>

namespace pastebin {

/// Connects to ip:port over plain TCP, retrying every ~300ms until
/// `deadlineSeconds` elapses. Throws std::runtime_error on timeout.
///
/// Deliberately does NOT probe-then-close: some DAP adapters (debugpy
/// with --wait-for-client) treat the first TCP connection as the debug
/// client, so the caller's real session socket must be the first and
/// only connection attempt that succeeds.
int connectTcpWithRetry(const std::string& ip, int port,
                         int deadlineSeconds);

} // namespace pastebin
