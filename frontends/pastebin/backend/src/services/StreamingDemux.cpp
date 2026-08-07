#include "StreamingDemux.hpp"

#include <cstdint>

namespace pastebin {

std::vector<DemuxFrame> StreamingDemux::feed(const std::string& chunk) {
    buf_ += chunk;
    std::vector<DemuxFrame> frames;

    size_t pos = 0;
    while (pos + 8 <= buf_.size()) {
        const unsigned char streamType =
            static_cast<unsigned char>(buf_[pos]);
        uint32_t size = 0;
        for (int i = 0; i < 4; ++i) {
            size = (size << 8) |
                   static_cast<unsigned char>(buf_[pos + 4 + i]);
        }
        const size_t payloadStart = pos + 8;
        if (payloadStart + size > buf_.size())
            break;
        frames.push_back({streamType, buf_.substr(payloadStart, size)});
        pos = payloadStart + size;
    }

    buf_.erase(0, pos);
    return frames;
}

} // namespace pastebin
