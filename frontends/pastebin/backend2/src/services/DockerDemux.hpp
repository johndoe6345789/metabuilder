#pragma once

#include <string>

namespace pastebin {

struct DemuxedStreams {
    std::string stdoutText;
    std::string stderrText;
};

/// Splits a raw Docker multiplexed log/attach stream (8-byte header:
/// stream-type byte, 3 reserved bytes, 4-byte big-endian size, then that
/// many payload bytes, repeated) into separate stdout/stderr text.
DemuxedStreams demuxDockerStream(const std::string& raw);

} // namespace pastebin
