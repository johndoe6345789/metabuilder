#pragma once

#include <string>

namespace pastebin {

/// Connects to a Unix domain socket, sends a raw HTTP/1.1 request, and
/// consumes the response headers, leaving the connection open. Docker's
/// /containers/{id}/attach endpoint "hijacks" the HTTP connection at
/// that point: it never closes it, and both directions become a raw
/// duplex byte stream (multiplexed stdout/stderr frames on read, plain
/// stdin bytes on write) for as long as the container runs. Returns the
/// connected file descriptor. Throws std::runtime_error on any failure,
/// including a non-2xx response status.
int connectAndHijack(const std::string& socketPath, const std::string& path);

} // namespace pastebin
