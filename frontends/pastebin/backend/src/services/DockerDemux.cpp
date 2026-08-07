#include "DockerDemux.hpp"

#include <cstdint>

namespace pastebin {

DemuxedStreams demuxDockerStream(const std::string& raw) {
    DemuxedStreams out;
    size_t pos = 0;
    while (pos + 8 <= raw.size()) {
        const unsigned char streamType =
            static_cast<unsigned char>(raw[pos]);
        uint32_t size = 0;
        for (int i = 0; i < 4; ++i) {
            size = (size << 8) |
                   static_cast<unsigned char>(raw[pos + 4 + i]);
        }
        const size_t payloadStart = pos + 8;
        if (payloadStart + size > raw.size())
            break;
        const std::string payload = raw.substr(payloadStart, size);
        if (streamType == 2)
            out.stderrText += payload;
        else
            out.stdoutText += payload;
        pos = payloadStart + size;
    }
    return out;
}

} // namespace pastebin
