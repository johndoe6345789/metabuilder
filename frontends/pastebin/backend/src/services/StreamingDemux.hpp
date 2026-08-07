#pragma once

#include <string>
#include <vector>

namespace pastebin {

struct DemuxFrame {
    int streamType = 0; // 1 = stdout, 2 = stderr
    std::string payload;
};

/// Incremental sibling of demuxDockerStream() (see DockerDemux.hpp) for a
/// live attach socket, where a frame's header or payload can be split
/// across successive reads. Buffers whatever's incomplete between calls.
class StreamingDemux {
  public:
    std::vector<DemuxFrame> feed(const std::string& chunk);

  private:
    std::string buf_;
};

} // namespace pastebin
